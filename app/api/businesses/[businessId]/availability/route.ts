import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";

// GET /api/businesses/[businessId]/availability — Calculate available time slots
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const { searchParams } = new URL(req.url);

    const resourceId = searchParams.get("resourceId");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!resourceId || !serviceId || !date) {
      return NextResponse.json(
        { error: "resourceId, serviceId, and date are required" },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Verify resource belongs to this business
    const resource = await prisma.resource.findFirst({
      where: { id: resourceId, businessId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found for this business" },
        { status: 404 }
      );
    }

    // Verify service belongs to this business
    const service = await prisma.service.findFirst({
      where: { id: serviceId, businessId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found for this business" },
        { status: 404 }
      );
    }

    // Get the day of week for the requested date
    const requestedDate = new Date(date + "T00:00:00");
    const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Get the resource's schedule blocks for that day
    const resourceScheduleBlocks = await prisma.resourceSchedule.findMany({
      where: { resourceId, dayOfWeek },
      orderBy: { startTime: "asc" },
    });

    if (resourceScheduleBlocks.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Get service schedule blocks for that day (if any are defined)
    const serviceScheduleBlocks = await prisma.serviceSchedule.findMany({
      where: { serviceId, dayOfWeek },
      orderBy: { startTime: "asc" },
    });

    // Intersect resource and service schedules: if the service has schedules defined,
    // a slot must fall within both a resource block and a service block.
    // If no service schedules are defined, only resource schedules apply.
    const scheduleBlocks =
      serviceScheduleBlocks.length === 0
        ? resourceScheduleBlocks
        : intersectScheduleBlocks(resourceScheduleBlocks, serviceScheduleBlocks);

    if (scheduleBlocks.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing confirmed bookings for this resource on this date
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    const existingBookings = await prisma.booking.findMany({
      where: {
        resourceId,
        date: { gte: startOfDay, lte: endOfDay },
        status: "CONFIRMED",
      },
      select: { startTime: true, endTime: true },
    });

    const durationMinutes = service.durationMinutes;
    const slots: { startTime: string; endTime: string }[] = [];

    // Generate slots within each schedule block
    for (const block of scheduleBlocks) {
      const blockStartMinutes = timeToMinutes(block.startTime);
      const blockEndMinutes = timeToMinutes(block.endTime);

      // Generate possible start times in 15-min increments (or duration-based, whichever is smaller)
      const increment = Math.min(15, durationMinutes);

      for (
        let startMin = blockStartMinutes;
        startMin + durationMinutes <= blockEndMinutes;
        startMin += increment
      ) {
        const endMin = startMin + durationMinutes;
        const slotStart = minutesToTime(startMin);
        const slotEnd = minutesToTime(endMin);

        // Check if this slot overlaps with any existing booking
        const hasConflict = existingBookings.some((booking) => {
          return slotStart < booking.endTime && slotEnd > booking.startTime;
        });

        if (!hasConflict) {
          slots.push({ startTime: slotStart, endTime: slotEnd });
        }
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function intersectScheduleBlocks(
  resourceBlocks: { startTime: string; endTime: string }[],
  serviceBlocks: { startTime: string; endTime: string }[]
): { startTime: string; endTime: string }[] {
  const result: { startTime: string; endTime: string }[] = [];

  for (const rb of resourceBlocks) {
    for (const sb of serviceBlocks) {
      const start = rb.startTime > sb.startTime ? rb.startTime : sb.startTime;
      const end = rb.endTime < sb.endTime ? rb.endTime : sb.endTime;
      if (start < end) {
        result.push({ startTime: start, endTime: end });
      }
    }
  }

  return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
