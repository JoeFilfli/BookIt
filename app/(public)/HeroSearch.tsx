"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "Food" },
  { value: "nightlife", label: "Nightlife" },
  { value: "events", label: "Events" },
  { value: "attractions-tourism", label: "Attractions & Tourism" },
  { value: "activities-experiences", label: "Activities & Experiences" },
  { value: "courts-sports", label: "Courts & Sports" },
  { value: "studios-classes", label: "Studios & Classes" },
  { value: "men-care", label: "Men Care" },
  { value: "women-care", label: "Women Care" },
  { value: "wellness", label: "Wellness" },
  { value: "health-care", label: "Health & Care" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = category === "all" ? "courts-sports" : category;
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("city", location.trim());
    router.push(`/${cat}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mt-8 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto"
    >
      <div className="flex flex-col md:flex-row">
        {/* Category */}
        <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-3.5 md:border-r border-b md:border-b-0 border-surface-border hover:bg-surface-dim transition-colors">
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--color-accent)" }} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm font-medium text-text-primary focus:outline-none cursor-pointer truncate"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-3.5 md:border-r border-b md:border-b-0 border-surface-border hover:bg-surface-dim transition-colors">
          <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--color-accent)" }} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or area..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>

        {/* Search text */}
        <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-3.5 hover:bg-surface-dim transition-colors">
          <Calendar className="w-4 h-4 shrink-0" style={{ color: "var(--color-accent)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venues..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="shrink-0 px-8 py-4 md:py-0 text-white text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ backgroundColor: "var(--color-accent)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-accent)")
          }
        >
          Search
        </button>
      </div>
    </form>
  );
}
