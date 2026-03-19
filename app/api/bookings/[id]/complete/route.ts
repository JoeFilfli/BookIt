import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireAuth } from "@/lib/auth/helpers";

// PATCH /api/bookings/[id]/complete
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        resource: {
          include: { business: { select: { ownerId: true } } },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed bookings can be marked as complete" },
        { status: 422 }
      );
    }

    // Only the business owner can mark complete
    if (booking.resource.business.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Only the business owner can mark a booking as complete" },
        { status: 403 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "COMPLETED" },
      include: {
        resource: {
          include: { business: { select: { id: true, name: true, slug: true } } },
        },
        service: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Complete booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
