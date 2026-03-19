import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireAuth } from "@/lib/auth/helpers";
import { sendBookingConfirmation, sendBookingNotification } from "@/lib/email/send";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// POST /api/bookings — Create a booking
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { resourceId, serviceId, date, startTime } = body;

    if (!resourceId || !serviceId || !date || !startTime) {
      return NextResponse.json(
        { error: "resourceId, serviceId, date, and startTime are required" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      return NextResponse.json(
        { error: "startTime must be in HH:MM format" },
        { status: 400 }
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      // 1. Verify resource exists and get its business
      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
        include: { business: { select: { id: true } } },
      });

      if (!resource) {
        throw { status: 404, message: "Resource not found" };
      }

      // 2. Verify service exists and belongs to same business
      const service = await tx.service.findFirst({
        where: { id: serviceId, businessId: resource.businessId },
      });

      if (!service) {
        throw { status: 404, message: "Service not found for this business" };
      }

      // 3. Calculate endTime
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = startMinutes + service.durationMinutes;
      const endTime = minutesToTime(endMinutes);

      // 4. Verify time slot is within resource's schedule for that day
      const bookingDate = new Date(date + "T00:00:00");
      const dayOfWeek = bookingDate.getDay();

      const schedules = await tx.resourceSchedule.findMany({
        where: { resourceId, dayOfWeek },
      });

      const withinSchedule = schedules.some(
        (s) => startTime >= s.startTime && endTime <= s.endTime
      );

      if (!withinSchedule) {
        throw { status: 422, message: "The selected time is outside the resource's schedule" };
      }

      // 5 & 6. Lock existing bookings for this resource on this date and check for overlaps
      // Use raw SQL SELECT FOR UPDATE to prevent concurrent double-bookings
      const startOfDay = new Date(date + "T00:00:00.000Z");
      const endOfDay = new Date(date + "T23:59:59.999Z");

      await tx.$executeRaw`
        SELECT id FROM "Booking"
        WHERE "resourceId" = ${resourceId}
          AND date >= ${startOfDay}
          AND date <= ${endOfDay}
          AND status = 'CONFIRMED'
        FOR UPDATE
      `;

      const conflicting = await tx.booking.findFirst({
        where: {
          resourceId,
          date: { gte: startOfDay, lte: endOfDay },
          status: "CONFIRMED",
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflicting) {
        throw { status: 409, message: "This slot is no longer available" };
      }

      // 7. Create the booking
      return tx.booking.create({
        data: {
          userId: user.id!,
          resourceId,
          serviceId,
          date: new Date(date + "T00:00:00.000Z"),
          startTime,
          endTime,
          status: "CONFIRMED",
          totalPrice: service.price,
        },
        include: {
          resource: {
            include: { business: { select: { id: true, name: true, slug: true } } },
          },
          service: { select: { id: true, name: true, durationMinutes: true, price: true, currency: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });
    });

    // Fire-and-forget emails — fetch full relations needed for templates
    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        user: { select: { name: true, email: true } },
        resource: {
          include: {
            business: {
              include: { owner: { select: { name: true, email: true } } },
            },
          },
        },
        service: { select: { name: true, currency: true } },
      },
    });

    if (fullBooking) {
      const payload = { booking: fullBooking as Parameters<typeof sendBookingConfirmation>[0]["booking"] };
      sendBookingConfirmation(payload).catch(console.error);
      sendBookingNotification(payload).catch(console.error);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/bookings — List current user's bookings
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: user.id };

    if (status && ["CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    if (upcoming === "true") {
      where.date = { gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    } else if (upcoming === "false") {
      where.date = { lt: new Date(new Date().setHours(0, 0, 0, 0)) };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          resource: {
            include: { business: { select: { id: true, name: true, slug: true } } },
          },
          service: { select: { id: true, name: true, durationMinutes: true, price: true, currency: true } },
          review: { select: { id: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("List bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
