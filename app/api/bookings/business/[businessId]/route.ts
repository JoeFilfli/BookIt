import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

// GET /api/bookings/business/[businessId] — List bookings for a business
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    await requireBusinessOwner(businessId);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const resourceId = searchParams.get("resourceId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      resource: { businessId },
    };

    if (status && ["CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      where.date = {
        gte: new Date(date + "T00:00:00.000Z"),
        lte: new Date(date + "T23:59:59.999Z"),
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          resource: { select: { id: true, name: true, type: true } },
          service: { select: { id: true, name: true, durationMinutes: true, price: true, currency: true } },
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
    console.error("List business bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
