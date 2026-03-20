"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  CalendarDays, Layers, Wrench, Clock, Building2, Star,
  TrendingUp, Users, ArrowRight, PlusCircle, ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const { data: businessData, isLoading } = useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await fetch("/api/businesses/my");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in required</h2>
        <p className="text-text-secondary mb-6">Please sign in to access your dashboard.</p>
        <Link href="/login?callbackUrl=/dashboard" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  // No business yet
  if (!businessData) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--color-accent-soft)" }}
        >
          <Building2 className="w-10 h-10" style={{ color: "var(--color-accent)" }} />
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-3">
          Welcome, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
          You don&apos;t have a business listing yet. Create one to start accepting bookings.
        </p>
        <Link
          href="/dashboard/create"
          className="btn-primary text-base inline-flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Create Your Business
        </Link>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: Building2, title: "Set up your profile", desc: "Add photos, description, and location" },
            { icon: Wrench, title: "Add your services", desc: "Define what you offer and pricing" },
            { icon: CalendarDays, title: "Accept bookings", desc: "Customers can book instantly" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-5 shadow-sm">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "var(--color-accent-soft)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
              </div>
              <div className="font-semibold text-text-primary text-sm">{title}</div>
              <div className="text-xs text-text-secondary mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const business = businessData;

  const STATS = [
    {
      icon: CalendarDays, label: "Total Bookings",
      value: business.totalBookings ?? 0, color: "var(--color-secondary)",
    },
    {
      icon: TrendingUp, label: "Upcoming",
      value: business.upcomingBookings ?? 0, color: "var(--color-success)",
    },
    {
      icon: Star, label: "Avg Rating",
      value: business.averageRating ? business.averageRating.toFixed(1) : "—", color: "var(--color-star)",
    },
    {
      icon: Users, label: "Total Reviews",
      value: business.reviewCount ?? 0, color: "var(--color-accent)",
    },
  ];

  const QUICK_LINKS = [
    { href: "/dashboard/resources", icon: Layers, label: "Manage Resources", desc: "Add/edit courts, staff, or rooms" },
    { href: "/dashboard/services", icon: Wrench, label: "Manage Services", desc: "Define your offerings and pricing" },
    { href: "/dashboard/schedules", icon: Clock, label: "Set Schedules", desc: "Configure availability hours" },
    { href: "/dashboard/bookings", icon: CalendarDays, label: "View Bookings", desc: "See and manage customer bookings" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">{business.name}</h1>
          <p className="text-text-secondary text-sm mt-0.5 capitalize">
            {business.category?.toLowerCase()} · {business.city}
          </p>
        </div>
        <Link
          href={`/business/${business.slug}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-surface-border text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-dim transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Public Page
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: color + "1a" }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-2xl font-extrabold text-text-primary">{value}</div>
            <div className="text-xs text-text-secondary mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl p-5 shadow-sm card-hover flex items-center gap-4 group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-accent-soft)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-primary text-sm group-hover:text-accent transition-colors">{label}</div>
                <div className="text-xs text-text-secondary mt-0.5">{desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Edit profile link */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <div className="font-semibold text-text-primary text-sm">Business Profile</div>
          <div className="text-xs text-text-secondary mt-0.5">Update your listing details and photos</div>
        </div>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Edit Profile <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
