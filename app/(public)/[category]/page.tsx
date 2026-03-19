"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBusinesses } from "@/lib/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BusinessCardSkeleton } from "@/app/components/Skeletons";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;

  const category = categorySlug === "sports" ? "SPORTS" : categorySlug === "salons" ? "SALON" : "";
  const categoryLabel = category === "SPORTS" ? "Sports Venues" : category === "SALON" ? "Salons" : categorySlug;

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBusinesses({
    category,
    search: search || undefined,
    city: city || undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    page,
    limit: 12,
    sort: "rating",
  });

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, city, minRating]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{categoryLabel}</h1>
          <p className="mt-2 text-gray-600">
            Find and book the best {categoryLabel.toLowerCase()} near you
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Business name..."
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Beirut"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any rating</option>
                  <option value="3">3+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BusinessCardSkeleton key={i} />
                ))}
              </div>
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No businesses found</p>
                <p className="text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.data?.map(
                    (business: {
                      id: string;
                      slug: string;
                      name: string;
                      city: string;
                      category: string;
                      images: string[];
                      averageRating: number;
                      reviewCount: number;
                      priceRange: { min: number; max: number } | null;
                    }) => (
                      <Link
                        key={business.id}
                        href={`/business/${business.slug}`}
                        className="group rounded-xl bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-gray-200 relative overflow-hidden">
                          {business.images?.[0] ? (
                            <img
                              src={business.images[0]}
                              alt={business.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                              {business.category === "SPORTS"
                                ? "\u26BD"
                                : "\u2702\uFE0F"}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {business.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {business.city}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <StarRating rating={business.averageRating} />
                            <span className="text-xs text-gray-400">
                              {business.reviewCount} reviews
                            </span>
                          </div>
                          {business.priceRange && (
                            <p className="mt-2 text-sm text-gray-600">
                              From ${business.priceRange.min}
                            </p>
                          )}
                        </div>
                      </Link>
                    )
                  )}
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {data.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage(Math.min(data.totalPages, page + 1))
                      }
                      disabled={page === data.totalPages}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
