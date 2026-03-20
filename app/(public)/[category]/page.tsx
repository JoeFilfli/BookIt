import { prisma } from "@/lib/utils/prisma";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";
import type { Metadata } from "next";
import { CATEGORY_CONFIG, slugToCategory } from "@/lib/categories/config";
import type { BusinessCategory } from "@/lib/types";

async function getInitialBusinesses(
  slug: string,
  search?: string,
  city?: string,
  minRating?: string,
  sort?: string,
) {
  const dbCategory = slugToCategory(slug);

  if (!dbCategory) {
    return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { category: dbCategory };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };

  const limit = 12;
  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        reviews: { select: { rating: true } },
        services: { select: { price: true } },
        _count: { select: { reviews: true } },
      },
      take: limit,
      orderBy: sort === "newest" ? { createdAt: "desc" } : { name: "asc" },
    }),
    prisma.business.count({ where }),
  ]);

  let enriched = businesses.map((b) => {
    const avgRating =
      b.reviews.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
        : 0;
    const prices = b.services.map((s) => Number(s.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
    return {
      id: b.id, name: b.name, slug: b.slug, city: b.city,
      category: b.category as string,
      images: b.images,
      extraFields: b.extraFields as Record<string, unknown> | null,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: b._count.reviews,
      priceRange: minPrice !== null ? { min: minPrice, max: maxPrice } : null,
    };
  });

  if (!sort || sort === "rating") {
    enriched = enriched.sort((a, b) => b.averageRating - a.averageRating);
  }
  if (minRating) {
    enriched = enriched.filter((b) => b.averageRating >= parseFloat(minRating));
  }

  return { data: enriched, total, page: 1, limit, totalPages: Math.ceil(total / limit) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const dbCat = slugToCategory(category);
  if (!dbCat) return {};
  const cfg = CATEGORY_CONFIG[dbCat];
  return {
    title: `${cfg.displayName} in Lebanon — BookIt`,
    description: `Find and book the best ${cfg.subtitle.toLowerCase()} in Lebanon. Browse ratings, compare prices, and book instantly on BookIt.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string; city?: string; minRating?: string; sort?: string }>;
}) {
  const { category } = await params;

  // Validate slug — 404 for unknown slugs
  if (!slugToCategory(category)) notFound();

  const { search, city, minRating, sort } = await searchParams;
  const initialData = await getInitialBusinesses(category, search, city, minRating, sort);

  return (
    <CategoryClient
      categorySlug={category}
      initialSearch={search || ""}
      initialCity={city || ""}
      initialMinRating={minRating || ""}
      initialSort={sort || "rating"}
      initialData={initialData}
    />
  );
}
