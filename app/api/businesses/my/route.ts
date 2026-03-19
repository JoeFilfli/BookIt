import { NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireAuth } from "@/lib/auth/helpers";

// GET /api/businesses/my — Get the current user's business with stats
export async function GET() {
  try {
    const user = await requireAuth();

    const business = await prisma.business.findFirst({
      where: { ownerId: user.id! },
      include: {
        reviews: { select: { rating: true } },
        resources: {
          include: {
            bookings: {
              select: { id: true, date: true, status: true },
            },
          },
        },
        services: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "No business found" },
        { status: 404 }
      );
    }

    // Calculate stats
    const allBookings = business.resources.flatMap((r) => r.bookings);
    const totalBookings = allBookings.length;
    const now = new Date();
    const upcomingBookings = allBookings.filter(
      (b) => b.status === "CONFIRMED" && new Date(b.date) >= now
    ).length;
    const avgRating =
      business.reviews.length > 0
        ? business.reviews.reduce((sum, r) => sum + r.rating, 0) /
          business.reviews.length
        : 0;

    const { reviews: _reviews, resources: _resources, ...rest } = business;

    return NextResponse.json({
      ...rest,
      totalBookings,
      upcomingBookings,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: business._count.reviews,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Get my business error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
