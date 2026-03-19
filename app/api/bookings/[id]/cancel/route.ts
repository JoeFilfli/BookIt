import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireAuth } from "@/lib/auth/helpers";
import { sendBookingCancellation } from "@/lib/email/send";

// PATCH /api/bookings/[id]/cancel
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
        { error: "Only confirmed bookings can be cancelled" },
        { status: 422 }
      );
    }

    // Only the booking user OR the business owner can cancel
    const isBookingUser = booking.userId === user.id;
    const isBusinessOwner = booking.resource.business.ownerId === user.id;

    if (!isBookingUser && !isBusinessOwner) {
      return NextResponse.json(
        { error: "You do not have permission to cancel this booking" },
        { status: 403 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        resource: {
          include: { business: { select: { id: true, name: true, slug: true } } },
        },
        service: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Fire-and-forget cancellation emails
    const fullBooking = await prisma.booking.findUnique({
      where: { id },
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
      const cancelledBy = booking.userId === user.id ? "customer" : "business";
      const payload = { booking: fullBooking as Parameters<typeof sendBookingCancellation>[0]["booking"] };
      sendBookingCancellation(payload, cancelledBy).catch(console.error);
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
