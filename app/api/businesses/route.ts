import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireAuth } from "@/lib/auth/helpers";
import { generateSlug, validateExtraFields } from "@/lib/utils";

// POST /api/businesses — Create a new business
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const {
      name,
      category,
      description,
      phone,
      address,
      city,
      latitude,
      longitude,
      images,
      extraFields,
    } = body;

    // Validate required fields
    if (!name || !category || !phone || !address || !city) {
      return NextResponse.json(
        { error: "name, category, phone, address, and city are required" },
        { status: 400 }
      );
    }

    if (!["SPORTS", "SALON"].includes(category)) {
      return NextResponse.json(
        { error: "category must be SPORTS or SALON" },
        { status: 400 }
      );
    }

    // Validate category-specific extra fields
    const validation = validateExtraFields(category, extraFields);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const slug = await generateSlug(name);

    const business = await prisma.business.create({
      data: {
        ownerId: user.id!,
        name,
        slug,
        category,
        description: description || null,
        phone,
        address,
        city,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        images: images || [],
        extraFields: extraFields || null,
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Create business error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/businesses — List businesses with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const minRating = searchParams.get("minRating");
    const sort = searchParams.get("sort") || "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category) {
      const cat = category.toUpperCase();
      if (["SPORTS", "SALON"].includes(cat)) {
        where.category = cat;
      }
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // Get businesses with review aggregation
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          reviews: { select: { rating: true } },
          services: { select: { price: true } },
          _count: { select: { reviews: true } },
        },
        skip,
        take: limit,
        orderBy: sort === "newest"
          ? { createdAt: "desc" }
          : sort === "name"
            ? { name: "asc" }
            : { createdAt: "desc" }, // default fallback, we'll sort by rating in JS
      }),
      prisma.business.count({ where }),
    ]);

    // Calculate average rating and price range
    const enriched = businesses.map((b) => {
      const avgRating =
        b.reviews.length > 0
          ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
          : 0;
      const prices = b.services.map((s) => Number(s.price));
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

      const { reviews: _reviews, services: _services, ...rest } = b;
      return {
        ...rest,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: b._count.reviews,
        priceRange: minPrice !== null ? { min: minPrice, max: maxPrice } : null,
      };
    });

    // Sort by rating if requested
    if (sort === "rating") {
      enriched.sort((a, b) => b.averageRating - a.averageRating);
    }

    // Filter by minimum rating
    const filtered = minRating
      ? enriched.filter((b) => b.averageRating >= parseFloat(minRating))
      : enriched;

    return NextResponse.json({
      data: filtered,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("List businesses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
