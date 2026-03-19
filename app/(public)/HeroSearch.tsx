"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = searchCategory === "all" ? "sports" : searchCategory;
    const path = `/${cat}${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`;
    router.push(path);
  };

  return (
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
  );
}
