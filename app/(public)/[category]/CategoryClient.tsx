"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams as useNextSearchParams, usePathname } from "next/navigation";
import {
  Search, MapPin, Star, X, ChevronLeft, ChevronRight,
  UtensilsCrossed, Wine, Ticket, Landmark, Compass, Trophy,
  GraduationCap, Scissors, Sparkles, Leaf, Heart,
} from "lucide-react";
import { CardGridSkeleton } from "@/app/components/ui";
import { slugToCategory, CATEGORY_CONFIG } from "@/lib/categories/config";

const ICON_MAP: Record<string, React.ElementType> = {
  UtensilsCrossed, Wine, Ticket, Landmark, Compass, Trophy,
  GraduationCap, Scissors, Sparkles, Leaf, Heart,
};

const CITIES = ["Beirut", "Jounieh", "Byblos", "Tripoli", "Sidon", "Batroun", "Broummana", "Zahle", "Faraya"];

type Business = {
  id: string; slug: string; name: string; city: string; category: string;
  images: string[];
  extraFields: Record<string, unknown> | null;
  averageRating: number; reviewCount: number;
  priceRange: { min: number; max: number | null } | null;
};

type BusinessListData = {
  data: Business[]; total: number; page: number; limit: number; totalPages: number;
};

/** Extract up to 3 relevant tags from a business based on its category extraFields */
function getCategoryTags(category: string, extraFields: Record<string, unknown> | null): string[] {
  if (!extraFields) return [];
  const f = extraFields;
  switch (category) {
    case "FOOD": {
      const tags: string[] = [];
      if (f.priceRange) tags.push(String(f.priceRange));
      if (f.diningStyle) tags.push(String(f.diningStyle).replace("_", " "));
      if (Array.isArray(f.cuisineTypes)) tags.push(...(f.cuisineTypes as string[]).slice(0, 2));
      return tags.slice(0, 3);
    }
    case "NIGHTLIFE": {
      const tags: string[] = [];
      if (f.venueType) tags.push(String(f.venueType));
      if (Array.isArray(f.musicGenre)) tags.push(...(f.musicGenre as string[]).slice(0, 2));
      return tags.slice(0, 3);
    }
    case "EVENTS":
      return Array.isArray(f.eventTypes) ? (f.eventTypes as string[]).slice(0, 3) : [];
    case "ATTRACTIONS_TOURISM":
      return Array.isArray(f.attractionType) ? (f.attractionType as string[]).slice(0, 3) : [];
    case "ACTIVITIES_EXPERIENCES": {
      const tags: string[] = [];
      if (f.difficultyLevel) tags.push(String(f.difficultyLevel));
      if (Array.isArray(f.activityTypes)) tags.push(...(f.activityTypes as string[]).slice(0, 2));
      return tags.slice(0, 3);
    }
    case "COURTS_SPORTS": {
      const tags: string[] = [];
      if (typeof f.isIndoor === "boolean") tags.push(f.isIndoor ? "Indoor" : "Outdoor");
      if (Array.isArray(f.sportTypes)) tags.push(...(f.sportTypes as string[]).slice(0, 2));
      return tags.slice(0, 3);
    }
    case "STUDIOS_CLASSES": {
      const tags: string[] = [];
      if (f.skillLevel) tags.push(String(f.skillLevel).replace("_", " "));
      if (Array.isArray(f.classTypes)) tags.push(...(f.classTypes as string[]).slice(0, 2));
      return tags.slice(0, 3);
    }
    case "MEN_CARE": {
      const tags = Array.isArray(f.specialties) ? (f.specialties as string[]).slice(0, 2) : [];
      if (f.walkInsAccepted) tags.push("Walk-ins OK");
      return tags.slice(0, 3);
    }
    case "WOMEN_CARE": {
      const tags = Array.isArray(f.specialties) ? (f.specialties as string[]).slice(0, 2) : [];
      if (f.genderFocus === "women_only") tags.push("Women Only");
      return tags.slice(0, 3);
    }
    case "WELLNESS": {
      const tags = Array.isArray(f.wellnessTypes) ? (f.wellnessTypes as string[]).slice(0, 2) : [];
      if (f.hasPool) tags.push("Pool");
      if (f.hasSauna) tags.push("Sauna");
      return tags.slice(0, 3);
    }
    case "HEALTH_CARE": {
      const tags = Array.isArray(f.healthServices) ? (f.healthServices as string[]).slice(0, 2) : [];
      if (f.acceptsInsurance) tags.push("Insurance OK");
      return tags.slice(0, 3);
    }
    default:
      return [];
  }
}

function BusinessCard({ business, categoryLabel }: { business: Business; categoryLabel: string }) {
  const tags = getCategoryTags(business.category, business.extraFields);

  return (
    <Link
      href={`/business/${business.slug}`}
      className="group block rounded-xl bg-white shadow-sm overflow-hidden card-hover"
    >
      <div className="aspect-[4/3] bg-surface-border relative overflow-hidden">
        {business.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.images[0]}
            alt={business.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl bg-surface-dim">🏢</div>
        )}
        <div
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
        >
          {categoryLabel}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
          {business.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-text-secondary text-sm">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {business.city}
        </div>
        {/* Category-specific tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-dim text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-star text-star" />
            <span className="text-sm font-semibold text-text-primary">
              {business.averageRating > 0 ? business.averageRating.toFixed(1) : "New"}
            </span>
            {business.reviewCount > 0 && (
              <span className="text-xs text-text-secondary">({business.reviewCount})</span>
            )}
          </div>
          {business.priceRange && business.priceRange.min > 0 && (
            <span className="text-sm font-semibold text-text-primary">
              from ${business.priceRange.min}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CategoryClient({
  categorySlug,
  initialSearch,
  initialCity,
  initialMinRating,
  initialSort,
  initialData,
}: {
  categorySlug: string;
  initialSearch: string;
  initialCity: string;
  initialMinRating: string;
  initialSort: string;
  initialData: BusinessListData | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [minRating, setMinRating] = useState(initialMinRating);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  // Resolve category config
  const dbCat = slugToCategory(categorySlug);
  const cfg = dbCat ? CATEGORY_CONFIG[dbCat] : null;
  const categoryLabel = cfg?.displayName ?? categorySlug;
  const CategoryIcon = cfg ? (ICON_MAP[cfg.icon] ?? Trophy) : Trophy;

  useEffect(() => { setPage(1); }, [search, city, minRating, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (minRating) params.set("minRating", minRating);
    if (sort !== "rating") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [search, city, minRating, sort, page, router, pathname]);

  const filters = {
    category: dbCat ?? undefined,
    search: search || undefined,
    city: city || undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    sort,
    page,
    limit: 12,
  };

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) queryParams.set(k, String(v)); });

  const isInitialState =
    !city && !minRating && page === 1 && search === initialSearch && sort === initialSort;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["businesses", filters],
    queryFn: async () => {
      const res = await fetch(`/api/businesses?${queryParams}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<BusinessListData>;
    },
    initialData: isInitialState ? (initialData ?? undefined) : undefined,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const hasActiveFilters = city || minRating || search;

  function clearFilters() {
    setSearch(""); setCity(""); setMinRating(""); setSort("rating"); setPage(1);
  }

  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Header */}
      <div className="section-dark py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: "var(--color-text-on-dark-muted)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">{categoryLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <CategoryIcon className="w-8 h-8" style={{ color: "var(--color-accent)" }} />
            <div>
              <h1 className="text-3xl font-extrabold text-white">{categoryLabel}</h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--color-text-on-dark-muted)" }}>
                {data?.total ?? 0} businesses found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-40 bg-white shadow-sm border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 py-1.5 rounded-lg border border-surface-border text-sm focus:outline-none focus:border-accent w-36"
              style={{ outlineColor: "var(--color-accent)" }}
            />
          </div>

          <select value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-1.5 rounded-lg border border-surface-border text-sm bg-white focus:outline-none focus:border-accent shrink-0">
            <option value="">All Cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="px-3 py-1.5 rounded-lg border border-surface-border text-sm bg-white focus:outline-none focus:border-accent shrink-0">
            <option value="">Any Rating</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-1.5 rounded-lg border border-surface-border text-sm bg-white focus:outline-none focus:border-accent shrink-0">
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors" style={{ color: "var(--color-error)", borderColor: "var(--color-error)", border: "1px solid" }}>
              <X className="w-3.5 h-3.5" /> Clear All
            </button>
          )}

          {city && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
              {city} <X className="w-3 h-3 cursor-pointer" onClick={() => setCity("")} />
            </span>
          )}
          {minRating && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
              {minRating}+ Stars <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating("")} />
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {(isLoading && !data) ? (
          <CardGridSkeleton count={6} />
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CategoryIcon className="w-14 h-14 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-text-primary mb-2">No businesses found</h3>
            <p className="text-text-secondary mb-6">Try adjusting your filters or check back later.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-primary text-sm">Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFetching ? "opacity-70" : "opacity-100"}`}>
              {data?.data?.map((business) => (
                <BusinessCard key={business.id} business={business} categoryLabel={categoryLabel} />
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-surface-border text-sm font-medium text-text-primary hover:bg-surface-dim disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm text-text-secondary font-medium">Page {page} of {data.totalPages}</span>
                <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-surface-border text-sm font-medium text-text-primary hover:bg-surface-dim disabled:opacity-40 transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
