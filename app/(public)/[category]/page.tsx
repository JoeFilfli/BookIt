import { prisma } from "@/lib/utils/prisma";
import CategoryClient from "./CategoryClient";

async function getInitialBusinesses(category: string, search?: string) {
  const dbCategory =
    category === "sports"
      ? "SPORTS"
      : category === "salons"
      ? "SALON"
      : null;

  if (!dbCategory) {
    return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }

  const where: { category: "SPORTS" | "SALON"; name?: { contains: string; mode: "insensitive" } } = {
    category: dbCategory,
  };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const limit = 12;
  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        reviews: { select: { rating: true } },
        services: { select: { price: true } },
        _count: { select: { reviews: true } },
      },
      skip: 0,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.business.count({ where }),
  ]);

  const enriched = businesses.map((b) => {
    const avgRating =
      b.reviews.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
        : 0;
    const prices = b.services.map((s) => Number(s.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      city: b.city,
      category: b.category as string,
      images: b.images,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: b._count.reviews,
      priceRange: minPrice !== null ? { min: minPrice, max: maxPrice } : null,
    };
  });

  enriched.sort((a, b) => b.averageRating - a.averageRating);

  return {
    data: enriched,
    total,
    page: 1,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { category } = await params;
  const { search } = await searchParams;

  const initialData = await getInitialBusinesses(category, search);

  return (
    <CategoryClient
      categorySlug={category}
      initialSearch={search || ""}
      initialData={initialData}
    />
  );
}
