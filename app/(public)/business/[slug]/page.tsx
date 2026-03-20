import { prisma } from "@/lib/utils/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Star } from "lucide-react";
import BookingPanel from "./BookingPanel";
import ReviewsSection from "./ReviewsSection";
import { CATEGORY_CONFIG } from "@/lib/categories/config";
import type { BusinessCategory } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const BASE_URL = process.env.NEXTAUTH_URL || "https://bookit.com";

/** Render category-specific detail info grid from extraFields */
function ExtraFieldsInfo({ category, extraFields }: { category: string; fields?: Record<string, unknown> | null; extraFields?: Record<string, unknown> | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = extraFields as Record<string, any> | null;
  if (!f) return null;

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-2 py-2 border-b border-surface-border last:border-0">
      <span className="text-sm font-medium text-text-secondary w-32 shrink-0">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );

  const TagList = ({ items }: { items: unknown[] }) => (
    <div className="flex flex-wrap gap-1">
      {(items as string[]).map((t) => (
        <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-dim text-text-secondary">{t}</span>
      ))}
    </div>
  );

  const Bool = ({ val }: { val: unknown }) => (
    <span style={{ color: val ? "var(--color-success)" : "var(--color-text-secondary)" }}>
      {val ? "✓ Yes" : "✗ No"}
    </span>
  );

  switch (category) {
    case "FOOD":
      return (
        <div>
          {f.cuisineTypes && Array.isArray(f.cuisineTypes) && <InfoRow label="Cuisine" value={<TagList items={f.cuisineTypes as string[]} />} />}
          {f.diningStyle && <InfoRow label="Style" value={String(f.diningStyle).replace("_", " ")} />}
          {f.priceRange && <InfoRow label="Price Range" value={String(f.priceRange)} />}
          <InfoRow label="Outdoor Seating" value={<Bool val={f.hasOutdoorSeating} />} />
          <InfoRow label="Delivery" value={<Bool val={f.hasDelivery} />} />
        </div>
      );
    case "NIGHTLIFE":
      return (
        <div>
          {f.venueType && <InfoRow label="Venue Type" value={<span className="capitalize">{String(f.venueType)}</span>} />}
          {f.musicGenre && Array.isArray(f.musicGenre) && <InfoRow label="Music" value={<TagList items={f.musicGenre as string[]} />} />}
          {f.dressCode && <InfoRow label="Dress Code" value={String(f.dressCode).replace("_", " ")} />}
          {f.ageRestriction && <InfoRow label="Age" value={`${f.ageRestriction}+`} />}
          <InfoRow label="VIP Available" value={<Bool val={f.hasVIP} />} />
        </div>
      );
    case "EVENTS":
      return (
        <div>
          {f.eventTypes && Array.isArray(f.eventTypes) && <InfoRow label="Event Types" value={<TagList items={f.eventTypes as string[]} />} />}
          {f.venueCapacity && <InfoRow label="Capacity" value={`${f.venueCapacity} guests`} />}
          <InfoRow label="Indoor" value={<Bool val={f.isIndoor} />} />
          <InfoRow label="Outdoor" value={<Bool val={f.isOutdoor} />} />
        </div>
      );
    case "ATTRACTIONS_TOURISM":
      return (
        <div>
          {f.attractionType && Array.isArray(f.attractionType) && <InfoRow label="Type" value={<TagList items={f.attractionType as string[]} />} />}
          {f.tourDuration && <InfoRow label="Duration" value={String(f.tourDuration)} />}
          {f.languages && Array.isArray(f.languages) && <InfoRow label="Languages" value={<TagList items={f.languages as string[]} />} />}
          <InfoRow label="Accessible" value={<Bool val={f.accessibility} />} />
        </div>
      );
    case "ACTIVITIES_EXPERIENCES":
      return (
        <div>
          {f.activityTypes && Array.isArray(f.activityTypes) && <InfoRow label="Activities" value={<TagList items={f.activityTypes as string[]} />} />}
          {f.difficultyLevel && <InfoRow label="Difficulty" value={<span className="capitalize">{String(f.difficultyLevel)}</span>} />}
          {(f.groupSizeMin !== undefined && f.groupSizeMax !== undefined) && <InfoRow label="Group Size" value={`${f.groupSizeMin} – ${f.groupSizeMax} people`} />}
          {f.ageRequirement && Number(f.ageRequirement) > 0 && <InfoRow label="Min Age" value={`${f.ageRequirement}+`} />}
        </div>
      );
    case "COURTS_SPORTS":
      return (
        <div>
          {f.sportTypes && Array.isArray(f.sportTypes) && <InfoRow label="Sports" value={<TagList items={f.sportTypes as string[]} />} />}
          {f.surfaceType && <InfoRow label="Surface" value={String(f.surfaceType)} />}
          {f.courtCount && <InfoRow label="Courts" value={String(f.courtCount)} />}
          <InfoRow label="Indoor" value={<Bool val={f.isIndoor} />} />
        </div>
      );
    case "STUDIOS_CLASSES":
      return (
        <div>
          {f.classTypes && Array.isArray(f.classTypes) && <InfoRow label="Classes" value={<TagList items={f.classTypes as string[]} />} />}
          {f.skillLevel && <InfoRow label="Level" value={String(f.skillLevel).replace("_", " ")} />}
          {f.maxClassSize && <InfoRow label="Class Size" value={`Up to ${f.maxClassSize}`} />}
          <InfoRow label="Equipment" value={<Bool val={f.providesEquipment} />} />
        </div>
      );
    case "MEN_CARE":
      return (
        <div>
          {f.specialties && Array.isArray(f.specialties) && <InfoRow label="Specialties" value={<TagList items={f.specialties as string[]} />} />}
          <InfoRow label="Walk-ins" value={<Bool val={f.walkInsAccepted} />} />
        </div>
      );
    case "WOMEN_CARE":
      return (
        <div>
          {f.specialties && Array.isArray(f.specialties) && <InfoRow label="Specialties" value={<TagList items={f.specialties as string[]} />} />}
          {f.genderFocus && <InfoRow label="Focus" value={f.genderFocus === "women_only" ? "Women Only" : "Unisex"} />}
        </div>
      );
    case "WELLNESS":
      return (
        <div>
          {f.wellnessTypes && Array.isArray(f.wellnessTypes) && <InfoRow label="Services" value={<TagList items={f.wellnessTypes as string[]} />} />}
          <InfoRow label="Pool" value={<Bool val={f.hasPool} />} />
          <InfoRow label="Sauna" value={<Bool val={f.hasSauna} />} />
          <InfoRow label="Couples" value={<Bool val={f.couplesAvailable} />} />
        </div>
      );
    case "HEALTH_CARE":
      return (
        <div>
          {f.healthServices && Array.isArray(f.healthServices) && <InfoRow label="Services" value={<TagList items={f.healthServices as string[]} />} />}
          <InfoRow label="Insurance" value={<Bool val={f.acceptsInsurance} />} />
          {f.licenseNumber && <InfoRow label="License" value={String(f.licenseNumber)} />}
        </div>
      );
    default:
      return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { name: true, description: true, category: true, city: true },
  });
  if (!business) return {};
  const cfg = CATEGORY_CONFIG[business.category as BusinessCategory];
  const catName = cfg?.displayName ?? business.category;
  return {
    title: `${business.name} — ${catName} in ${business.city} | BookIt`,
    description: business.description
      ? business.description.slice(0, 160)
      : `Book ${business.name} on BookIt. ${catName} in ${business.city}, Lebanon.`,
  };
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      resources: {
        include: { schedules: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
      },
      services: { orderBy: { name: "asc" } },
    },
  });

  if (!business) notFound();

  const [reviewAggregate, initialReviews, totalReviews] = await Promise.all([
    prisma.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { businessId: business.id },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.count({ where: { businessId: business.id } }),
  ]);

  const averageRating = reviewAggregate._avg.rating
    ? Math.round(reviewAggregate._avg.rating * 10) / 10
    : 0;
  const totalPages = Math.ceil(totalReviews / 10);

  const cfg = CATEGORY_CONFIG[business.category as BusinessCategory];
  const categorySlug = cfg?.slug ?? "courts-sports";
  const categoryLabel = cfg?.displayName ?? business.category;
  const resourceHeading = cfg?.resourceSectionHeading ?? "Our Resources";

  // Operating hours
  const allSchedules = business.resources.flatMap((r) => r.schedules);
  const hoursByDay: Record<number, { start: string; end: string }> = {};
  for (const s of allSchedules) {
    if (!hoursByDay[s.dayOfWeek]) {
      hoursByDay[s.dayOfWeek] = { start: s.startTime, end: s.endTime };
    } else {
      if (s.startTime < hoursByDay[s.dayOfWeek].start) hoursByDay[s.dayOfWeek].start = s.startTime;
      if (s.endTime > hoursByDay[s.dayOfWeek].end) hoursByDay[s.dayOfWeek].end = s.endTime;
    }
  }

  const serializedServices = business.services.map((s) => ({
    id: s.id, name: s.name, description: s.description,
    durationMinutes: s.durationMinutes, price: s.price.toString(), currency: s.currency,
  }));
  const serializedResources = business.resources.map((r) => ({
    id: r.id, name: r.name, description: r.description,
    type: r.type as string, imageUrl: r.imageUrl,
  }));
  const serializedReviews = initialReviews.map((r) => ({
    id: r.id, rating: r.rating, comment: r.comment,
    createdAt: r.createdAt.toISOString(), user: r.user,
  }));

  const minPrice = serializedServices.length > 0
    ? Math.min(...serializedServices.map((s) => Number(s.price)))
    : null;

  const extraFields = business.extraFields as Record<string, unknown> | null;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description ?? undefined,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressCountry: "LB",
    },
    image: business.images[0] ?? undefined,
    aggregateRating: averageRating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: totalReviews,
    } : undefined,
    url: `${BASE_URL}/business/${business.slug}`,
  };

  return (
    <div className="min-h-screen bg-surface-dim">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Image Gallery */}
      <div className="bg-primary-light">
        {business.images.length > 0 ? (
          <div className="mx-auto max-w-7xl">
            <div className="relative aspect-[16/7] md:aspect-[21/8] overflow-hidden rounded-b-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={business.images[0]} alt={business.name} className="w-full h-full object-cover" />
              {business.images.length > 1 && (
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-1 p-1 pointer-events-none">
                  <div className="col-span-3 row-span-2" />
                  {business.images.slice(1, 3).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="" className="col-span-2 h-full w-full object-cover rounded-lg pointer-events-auto" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-6xl">🏢</div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Business Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                <span>/</span>
                <Link href={`/${categorySlug}`} className="hover:text-accent transition-colors capitalize">
                  {categoryLabel}
                </Link>
              </div>

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                  >
                    {categoryLabel}
                  </span>
                  <h1 className="text-3xl font-extrabold text-text-primary">{business.name}</h1>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {averageRating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 fill-star text-star" />
                        <span className="font-bold text-text-primary">{averageRating}</span>
                        <span className="text-text-secondary text-sm">({totalReviews} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-text-secondary text-sm">
                      <MapPin className="w-4 h-4" />
                      {business.address}, {business.city}
                    </div>
                    <a href={`tel:${business.phone}`} className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: "var(--color-accent)" }}>
                      <Phone className="w-4 h-4" />
                      {business.phone}
                    </a>
                  </div>
                </div>
                {minPrice !== null && minPrice > 0 && (
                  <div className="text-right shrink-0">
                    <div className="text-xs text-text-secondary">Starting from</div>
                    <div className="text-2xl font-extrabold text-text-primary">${minPrice}</div>
                  </div>
                )}
              </div>

              {business.description && (
                <p className="mt-4 text-text-secondary leading-relaxed">{business.description}</p>
              )}
            </div>

            {/* Category-specific details */}
            {extraFields && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-text-primary mb-4">About</h2>
                <ExtraFieldsInfo category={business.category} extraFields={extraFields} />
              </div>
            )}

            {/* Operating Hours */}
            {Object.keys(hoursByDay).length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-text-primary mb-4">Operating Hours</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {DAYS.map((day, i) => (
                    <div key={day} className="flex justify-between py-2 border-b border-surface-border last:border-0">
                      <span className="text-sm font-medium text-text-primary">{day}</span>
                      <span className={`text-sm ${hoursByDay[i] ? "font-medium" : "text-text-secondary"}`}
                        style={hoursByDay[i] ? { color: "var(--color-success)" } : undefined}>
                        {hoursByDay[i] ? `${hoursByDay[i].start} – ${hoursByDay[i].end}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {serializedServices.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-text-primary mb-4">Services</h2>
                <div className="space-y-0">
                  {serializedServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                      <div>
                        <div className="font-semibold text-text-primary">{service.name}</div>
                        {service.description && <div className="text-sm text-text-secondary mt-0.5">{service.description}</div>}
                        <div className="text-sm text-text-secondary mt-0.5">{service.durationMinutes} min</div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {Number(service.price) > 0 ? (
                          <>
                            <div className="text-lg font-bold text-text-primary">${Number(service.price).toFixed(0)}</div>
                            <div className="text-xs text-text-secondary">{service.currency}</div>
                          </>
                        ) : (
                          <div className="text-sm font-medium" style={{ color: "var(--color-success)" }}>Free</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {serializedResources.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-text-primary mb-4">{resourceHeading}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serializedResources.map((resource) => (
                    <div key={resource.id} className="rounded-xl border border-surface-border overflow-hidden">
                      {resource.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resource.imageUrl} alt={resource.name} className="h-36 w-full object-cover" />
                      ) : (
                        <div className="h-24 bg-surface-dim flex items-center justify-center text-3xl">
                          {resource.type === "COURT" ? "🏟️" : resource.type === "STAFF" || resource.type === "INSTRUCTOR" || resource.type === "GUIDE" ? "👤" : resource.type === "TABLE" ? "🪑" : "🏠"}
                        </div>
                      )}
                      <div className="p-3">
                        <div className="font-semibold text-text-primary">{resource.name}</div>
                        <div className="text-xs text-text-secondary capitalize mt-0.5">{resource.type.replace("_", " ").toLowerCase()}</div>
                        {resource.description && <div className="text-sm text-text-secondary mt-1">{resource.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewsSection
              businessId={business.id}
              initialReviews={serializedReviews}
              totalReviews={totalReviews}
              averageRating={averageRating}
              totalPages={totalPages}
            />
          </div>

          {/* ── RIGHT COLUMN — Booking Panel ── */}
          <BookingPanel
            businessId={business.id}
            businessSlug={business.slug}
            businessCategory={business.category as string}
            services={serializedServices}
            resources={serializedResources}
            minPrice={minPrice}
          />
        </div>
      </div>
    </div>
  );
}
