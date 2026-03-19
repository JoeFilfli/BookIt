import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireAuth } from "@/lib/auth/helpers";

// POST /api/reviews — Submit a review for a completed booking
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || rating === undefined) {
      return NextResponse.json(
        { error: "bookingId and rating are required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify booking exists and belongs to the current user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resource: { select: { businessId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only review your own bookings" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You can only review completed bookings" },
        { status: 422 }
      );
    }

    // Check no existing review for this booking (unique constraint enforced by DB too)
    const existing = await prisma.review.findUnique({ where: { bookingId } });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this booking" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id!,
        businessId: booking.resource.businessId,
        bookingId,
        rating,
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
