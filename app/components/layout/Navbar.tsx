"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  UtensilsCrossed,
  Wine,
  Ticket,
  Landmark,
  Compass,
  Trophy,
  GraduationCap,
  Scissors,
  Sparkles,
  Leaf,
  Heart,
  User,
  CalendarDays,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const CATEGORIES = [
  { slug: "food", name: "Food", icon: UtensilsCrossed, subtitle: "Restaurants & dining" },
  { slug: "nightlife", name: "Nightlife", icon: Wine, subtitle: "Bars, clubs & lounges" },
  { slug: "events", name: "Events", icon: Ticket, subtitle: "Concerts & shows" },
  { slug: "attractions-tourism", name: "Attractions & Tourism", icon: Landmark, subtitle: "Sightseeing & tours" },
  { slug: "activities-experiences", name: "Activities & Experiences", icon: Compass, subtitle: "Adventures & outings" },
  { slug: "courts-sports", name: "Courts & Sports", icon: Trophy, subtitle: "Padel, tennis & more" },
  { slug: "studios-classes", name: "Studios & Classes", icon: GraduationCap, subtitle: "Art, music & fitness" },
  { slug: "men-care", name: "Men Care", icon: Scissors, subtitle: "Barbershops & grooming" },
  { slug: "women-care", name: "Women Care", icon: Sparkles, subtitle: "Hair, beauty & nails" },
  { slug: "wellness", name: "Wellness", icon: Leaf, subtitle: "Spa, massage & relaxation" },
  { slug: "health-care", name: "Health & Care", icon: Heart, subtitle: "Clinics & therapy" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");
  const exploreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/courts-sports?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
    }
  };

  const initials = session?.user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-primary h-16 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight">
            <span className="text-white">Book</span>
            <span style={{ color: "var(--color-accent)" }}>It</span>
          </Link>

          {/* Desktop: Explore dropdown + search */}
          <div className="hidden lg:flex flex-1 items-center gap-4 max-w-2xl">
            {/* Explore */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setExploreOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                style={{ color: "var(--color-text-on-dark-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) =>
                  !exploreOpen &&
                  (e.currentTarget.style.color = "var(--color-text-on-dark-muted)")
                }
              >
                Explore
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`}
                />
              </button>

              {exploreOpen && (
                <div className="absolute left-0 top-full mt-2 w-[600px] bg-white rounded-xl shadow-xl border border-surface-border p-4 animate-[fade-in_0.15s_ease-out]">
                  <div className="grid grid-cols-2 gap-1">
                    {CATEGORIES.map(({ slug, name, icon: Icon, subtitle }) => (
                      <Link
                        key={slug}
                        href={`/${slug}`}
                        onClick={() => setExploreOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-dim transition-colors group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "var(--color-accent-soft)" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                            {name}
                          </div>
                          <div className="text-xs text-text-secondary">{subtitle}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search businesses..."
                  className="w-full bg-white rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 border border-surface-border"
                />
              </div>
            </form>
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-2">
            {session ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {session.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={initials}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-surface-border overflow-hidden animate-[fade-in_0.15s_ease-out]">
                    <div className="px-4 py-3 border-b border-surface-border">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {session.user?.name}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {session.user?.email}
                      </div>
                    </div>
                    <Link
                      href="/bookings"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-dim transition-colors"
                    >
                      <CalendarDays className="w-4 h-4 text-text-secondary" />
                      My Bookings
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-dim transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-text-secondary" />
                      Business Dashboard
                    </Link>
                    <button
                      onClick={() => { setUserOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  style={{ color: "var(--color-text-on-dark-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-text-on-dark-muted)")
                  }
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard/create"
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--color-accent)")
                  }
                >
                  List Your Business
                </Link>
              </>
            )}
          </div>

          {/* Mobile: search + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => {
                const s = prompt("Search:");
                if (s) router.push(`/courts-sports?search=${encodeURIComponent(s)}`);
              }}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl overflow-y-auto animate-[slide-left_0.25s_ease-out]">
            <div className="p-4 border-b border-surface-border">
              {session ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {session.user?.name}
                    </div>
                    <div className="text-xs text-text-secondary">{session.user?.email}</div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg border-2 border-primary text-primary text-sm font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/dashboard/create"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    List Business
                  </Link>
                </div>
              )}
            </div>

            {session && (
              <div className="p-2 border-b border-surface-border">
                <Link
                  href="/bookings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-surface-dim"
                >
                  <CalendarDays className="w-4 h-4 text-text-secondary" />
                  My Bookings
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-surface-dim"
                >
                  <LayoutDashboard className="w-4 h-4 text-text-secondary" />
                  Business Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-error/5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}

            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Categories
              </p>
              {CATEGORIES.map(({ slug, name, icon: Icon }) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-surface-dim"
                >
                  <Icon className="w-4 h-4 text-text-secondary" />
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
