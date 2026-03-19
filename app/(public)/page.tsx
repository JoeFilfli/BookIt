"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  slug: string;
  city: string;
  images: string[];
  averageRating: number;
  reviewCount: number;
  minPrice: number | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400">★</span>
      <span className="text-sm font-medium text-gray-700">{rating > 0 ? rating.toFixed(1) : "New"}</span>
    </div>
  );
}

function BusinessCard({ business, category }: { business: Business; category: string }) {
  return (
    <Link href={`/business/${business.slug}`} className="group block rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-gray-100">
        {business.images?.[0] ? (
          <img src={business.images[0]} alt={business.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-gray-300">
            {category === "sports" ? "🏟️" : "✂️"}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{business.city}</p>
        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={business.averageRating} />
          {business.minPrice !== null && (
            <span className="text-sm font-medium text-gray-700">from ${business.minPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  const { data: featured } = useQuery({
    queryKey: ["featured-businesses"],
    queryFn: async () => {
      const res = await fetch("/api/businesses/featured");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ sports: Business[]; salons: Business[] }>;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = searchCategory === "all" ? "sports" : searchCategory;
    const path = `/${cat}${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`;
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Book Sports Courts & Salons in Lebanon
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Find and book the best venues instantly — no calls, no waiting.
          </p>

          <form onSubmit={handleSearch} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex flex-1 overflow-hidden rounded-xl bg-white shadow-lg">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="border-r border-gray-200 bg-gray-50 px-3 py-3.5 text-sm text-gray-700 focus:outline-none rounded-l-xl"
              >
                <option value="all">All</option>
                <option value="sports">Sports</option>
                <option value="salons">Salons</option>
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or city..."
                className="flex-1 px-4 py-3.5 text-gray-900 focus:outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 shadow-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category Tiles */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/sports" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 p-8 text-white hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🏟️</div>
            <h3 className="text-2xl font-bold">Sports & Courts</h3>
            <p className="mt-2 text-green-100 text-sm">
              Padel, tennis, basketball, football and more
            </p>
            {featured?.sports && (
              <p className="mt-3 text-xs font-medium text-green-200">
                {featured.sports.length}+ venues available
              </p>
            )}
            <span className="mt-4 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold group-hover:bg-white/30 transition-colors">
              Browse Sports →
            </span>
          </Link>

          <Link href="/salons" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-8 text-white hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">✂️</div>
            <h3 className="text-2xl font-bold">Salons</h3>
            <p className="mt-2 text-purple-100 text-sm">
              Haircuts, coloring, nails, facials and more
            </p>
            {featured?.salons && (
              <p className="mt-3 text-xs font-medium text-purple-200">
                {featured.salons.length}+ salons available
              </p>
            )}
            <span className="mt-4 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold group-hover:bg-white/30 transition-colors">
              Browse Salons →
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Sports */}
      {featured?.sports && featured.sports.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Popular in Sports</h2>
            <Link href="/sports" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.sports.map((b) => (
              <BusinessCard key={b.id} business={b} category="sports" />
            ))}
          </div>
        </section>
      )}

      {/* Featured Salons */}
      {featured?.salons && featured.salons.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Popular in Salons</h2>
            <Link href="/salons" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.salons.map((b) => (
              <BusinessCard key={b.id} business={b} category="salons" />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-bold text-blue-600">BookIt</p>
              <p className="mt-1 text-sm text-gray-500">The easiest way to book in Lebanon.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <Link href="/sports" className="hover:text-gray-900">Sports</Link>
              <Link href="/salons" className="hover:text-gray-900">Salons</Link>
              <Link href="/dashboard" className="hover:text-gray-900">List Your Business</Link>
              <span className="text-gray-300">|</span>
              <span>About</span>
              <span>Contact</span>
              <span>Terms</span>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} BookIt. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
