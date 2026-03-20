import { NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";

// GET /api/businesses/featured — top 4 per category by average rating
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        reviews: { select: { rating: true } },
        services: { select: { price: true } },
        _count: { select: { reviews: true } },
      },
    });

    const enriched = businesses.map((b) => {
      const avgRating =
        b.reviews.length > 0
          ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
          : 0;
      const prices = b.services.map((s) => Number(s.price));
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;

      const { reviews: _r, services: _s, ...rest } = b;
      return {
        ...rest,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: b._count.reviews,
        minPrice,
      };
    });

    const sports = enriched
      .filter((b) => b.category === "COURTS_SPORTS")
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4);

    const salons = enriched
      .filter((b) => b.category === "WOMEN_CARE" || b.category === "MEN_CARE")
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4);

    return NextResponse.json({ sports, salons });
  } catch (error) {
    console.error("Featured businesses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
