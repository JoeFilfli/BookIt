"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign in required</h1>
          <p className="mt-2 text-gray-600">
            Please sign in to access the dashboard.
          </p>
          <Link
            href="/login?callbackUrl=/dashboard"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // No business yet — show create CTA
  if (!businessData) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session?.user?.name}!
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            You don&apos;t have a business yet. Create one to start receiving
            bookings.
          </p>
          <Link
            href="/dashboard/create"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Create Your Business
          </Link>
        </div>
      </main>
    );
  }

  const business = businessData;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {business.name}
            </h1>
            <p className="text-sm text-gray-500 capitalize">
              {business.category.toLowerCase()} &middot; {business.city}
            </p>
          </div>
          <Link
            href={`/business/${business.slug}`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View Public Page
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {business.totalBookings ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Upcoming Bookings</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {business.upcomingBookings ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {business.averageRating
                ? `${business.averageRating} / 5`
                : "No reviews"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href={`/dashboard/resources`}
            className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900">Manage Resources</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add and manage courts, staff, or rooms
            </p>
          </Link>
          <Link
            href={`/dashboard/services`}
            className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900">Manage Services</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add and manage your service offerings
            </p>
          </Link>
          <Link
            href={`/dashboard/schedules`}
            className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900">Manage Schedules</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set availability for your resources
            </p>
          </Link>
          <Link
            href={`/dashboard/bookings`}
            className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900">View Bookings</h3>
            <p className="mt-1 text-sm text-gray-500">
              See and manage customer bookings
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
