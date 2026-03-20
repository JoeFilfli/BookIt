import { prisma } from "@/lib/utils/prisma";
import Link from "next/link";
import HeroSearch from "./HeroSearch";
import {
  UtensilsCrossed, Wine, Ticket, Landmark, Compass,
  Trophy, GraduationCap, Scissors, Sparkles, Leaf, Heart,
  Star, MapPin, Search, CheckCircle, Calendar, Smile,
  ArrowRight,
} from "lucide-react";

// ──────────────────────────────────────────
//  Category config
// ──────────────────────────────────────────
const CATEGORIES = [
  {
    slug: "food", name: "Food", icon: UtensilsCrossed,
    subtitle: "Restaurants & dining",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  },
  {
    slug: "nightlife", name: "Nightlife", icon: Wine,
    subtitle: "Bars, clubs & lounges",
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&q=80",
  },
  {
    slug: "events", name: "Events", icon: Ticket,
    subtitle: "Concerts & shows",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
  },
  {
    slug: "attractions-tourism", name: "Attractions & Tourism", icon: Landmark,
    subtitle: "Sightseeing & tours",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  },
  {
    slug: "activities-experiences", name: "Activities", icon: Compass,
    subtitle: "Adventures & outings",
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80",
  },
  {
    slug: "courts-sports", name: "Courts & Sports", icon: Trophy,
    subtitle: "Padel, tennis & more",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
  },
  {
    slug: "studios-classes", name: "Studios & Classes", icon: GraduationCap,
    subtitle: "Art, music & fitness",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
  },
  {
    slug: "men-care", name: "Men Care", icon: Scissors,
    subtitle: "Barbershops & grooming",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
  },
  {
    slug: "women-care", name: "Women Care", icon: Sparkles,
    subtitle: "Hair, beauty & nails",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
  },
  {
    slug: "wellness", name: "Wellness", icon: Leaf,
    subtitle: "Spa, massage & relaxation",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
  },
  {
    slug: "health-care", name: "Health & Care", icon: Heart,
    subtitle: "Clinics & therapy",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80",
  },
];

// ──────────────────────────────────────────
//  Data fetching
// ──────────────────────────────────────────
async function getFeaturedBusinesses() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        reviews: { select: { rating: true } },
        services: { select: { price: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return businesses.map((b) => {
      const avgRating =
        b.reviews.length > 0
          ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
          : 0;
      const prices = b.services.map((s) => Number(s.price));
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        city: b.city,
        images: b.images,
        category: b.category,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: b._count.reviews,
        minPrice,
      };
    });
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────
//  Business Card
// ──────────────────────────────────────────
function BusinessCard({
  business,
}: {
  business: {
    id: string; name: string; slug: string; city: string;
    images: string[]; averageRating: number; reviewCount: number; minPrice: number | null;
  };
}) {
  return (
    <Link
      href={`/business/${business.slug}`}
      className="group block rounded-xl overflow-hidden bg-white shadow-sm card-hover"
    >
      <div className="relative aspect-[4/3] bg-surface-border overflow-hidden">
        {business.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.images[0]}
            alt={business.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl">
            🏢
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text-primary truncate">{business.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-text-secondary text-sm">
          <MapPin className="w-3.5 h-3.5" />
          {business.city}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-star text-star" />
            <span className="text-sm font-medium text-text-primary">
              {business.averageRating > 0 ? business.averageRating.toFixed(1) : "New"}
            </span>
            {business.reviewCount > 0 && (
              <span className="text-xs text-text-secondary">
                ({business.reviewCount})
              </span>
            )}
          </div>
          {business.minPrice !== null && (
            <span className="text-sm font-semibold text-text-primary">
              from ${business.minPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────
//  Page
// ──────────────────────────────────────────
export default async function HomePage() {
  const allBusinesses = await getFeaturedBusinesses();
  const featuredSports = allBusinesses
    .filter((b) => (b.category as string) === "COURTS_SPORTS")
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 4);
  const featuredSalons = allBusinesses
    .filter((b) => (b.category as string) === "WOMEN_CARE" || (b.category as string) === "MEN_CARE")
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 4);

  return (
    <div>
      {/* ── HERO ── */}
      <section
        className="relative min-h-[500px] md:min-h-[560px] flex items-center justify-center py-16 px-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-secondary) 100%)",
        }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(233,69,96,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Discover &amp; Book the Best in Lebanon
          </h1>
          <p
            className="mt-4 text-lg md:text-xl"
            style={{ color: "var(--color-text-on-dark-muted)" }}
          >
            Sports, salons, dining, nightlife, wellness and more — all in one place
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 px-4 bg-surface-dim">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-10">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map(({ slug, name, icon: Icon, subtitle, image }) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="category-tile group relative rounded-xl overflow-hidden aspect-[3/2] block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <Icon className="w-6 h-6 text-white mb-1.5" />
                  <div className="text-white font-bold text-sm leading-tight">{name}</div>
                  <div className="text-white/70 text-xs mt-0.5">{subtitle}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED BUSINESSES ── */}
      {(featuredSports.length > 0 || featuredSalons.length > 0) && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            {featuredSports.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Popular Courts & Sports
                  </h2>
                  <Link
                    href="/courts-sports"
                    className="flex items-center gap-1 text-sm font-semibold transition-colors"
                    style={{ color: "var(--color-accent)" }}
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto">
                  {featuredSports.map((b) => (
                    <BusinessCard key={b.id} business={b} />
                  ))}
                </div>
              </div>
            )}
            {featuredSalons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Popular Salons
                  </h2>
                  <Link
                    href="/women-care"
                    className="flex items-center gap-1 text-sm font-semibold transition-colors"
                    style={{ color: "var(--color-accent)" }}
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredSalons.map((b) => (
                    <BusinessCard key={b.id} business={b} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="section-dark py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">How BookIt Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div
              className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5"
              style={{ backgroundColor: "rgba(233,69,96,0.3)" }}
            />
            {[
              {
                icon: Search,
                step: "1",
                title: "Search",
                desc: "Browse thousands of venues across Lebanon by category, city, or rating.",
              },
              {
                icon: Calendar,
                step: "2",
                title: "Book",
                desc: "Pick a time slot and confirm instantly — no calls, no waiting.",
              },
              {
                icon: Smile,
                step: "3",
                title: "Enjoy",
                desc: "Show up and enjoy your experience. Leave a review to help others.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white relative z-10"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-on-dark-muted)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className="py-16 px-4 text-center text-white"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-2">Own a business?</h2>
          <p className="text-white/80 text-lg mb-8">
            Get listed on BookIt and reach thousands of customers looking to book.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 bg-white font-bold px-8 py-3 rounded-xl transition-all hover:bg-white/90 active:scale-[0.98]"
            style={{ color: "var(--color-accent)" }}
          >
            <CheckCircle className="w-5 h-5" />
            List Your Business — It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}
