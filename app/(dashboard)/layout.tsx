"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  Wrench,
  Clock,
  Building2,
  BookOpen,
} from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/resources", label: "Resources", icon: Layers },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/schedules", label: "Schedules", icon: Clock },
  { href: "/dashboard/profile", label: "Profile", icon: Building2 },
];

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-white border-r border-surface-border min-h-full">
      <div className="p-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5 px-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--color-accent-soft)" }}
          >
            <BookOpen className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          </div>
          <span className="text-sm font-semibold text-text-primary">Business Hub</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href) && !(exact && pathname !== href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors
                ${
                  active
                    ? "text-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-dim"
                }
              `}
              style={
                active
                  ? { backgroundColor: "var(--color-accent-soft)" }
                  : undefined
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-border">
      <div className="grid grid-cols-5 h-14">
        {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5"
            >
              <Icon
                className={`w-5 h-5 ${active ? "text-accent" : "text-text-secondary"}`}
              />
              <span
                className={`text-[10px] font-medium ${active ? "text-accent" : "text-text-secondary"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar pathname={pathname} />
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileBottomNav pathname={pathname} />
    </div>
  );
}
