"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useBusinessBookings, useResources, useCancelBooking, useCompleteBooking } from "@/lib/hooks";
import Link from "next/link";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: string;
  user: { id: string; name: string; email: string };
  resource: { id: string; name: string; type: string };
  service: { id: string; name: string; durationMinutes: number; price: string; currency: string };
}

export default function BusinessBookingsPage() {
  const { status: authStatus } = useSession();
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [actionError, setActionError] = useState("");

  const { data: businessData } = useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await fetch("/api/businesses/my");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business");
      return res.json();
    },
    enabled: authStatus === "authenticated",
  });

  const businessId = businessData?.id || "";

  const { data: resourcesData } = useResources(businessId);
  const resources = (resourcesData as Array<{ id: string; name: string }>) || [];

  const { data, isLoading, refetch } = useBusinessBookings(businessId, {
    status: statusFilter || undefined,
    date: dateFilter || undefined,
    resourceId: resourceFilter || undefined,
  });

  const cancelBooking = useCancelBooking();
  const completeBooking = useCompleteBooking();

  const bookings: Booking[] = data?.data || [];

  if (authStatus === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!businessData) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-gray-600">You need to create a business first.</p>
          <Link
            href="/dashboard/create"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Your Business
          </Link>
        </div>
      </main>
    );
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking?")) return;
    setActionError("");
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled.");
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel");
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    }
  };

  const handleComplete = async (bookingId: string) => {
    setActionError("");
    try {
      await completeBooking.mutateAsync(bookingId);
      toast.success("Booking marked as complete.");
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to mark complete");
      toast.error(err instanceof Error ? err.message : "Failed to mark complete");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Bookings</h1>
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Resources</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {(statusFilter || resourceFilter || dateFilter) && (
            <button
              onClick={() => { setStatusFilter(""); setResourceFilter(""); setDateFilter(""); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{booking.user.name}</p>
                      <p className="text-xs text-gray-500">{booking.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{booking.service.name}</p>
                      <p className="text-xs text-gray-500">${Number(booking.totalPrice).toFixed(2)} {booking.service.currency}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{booking.resource.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{booking.startTime} – {booking.endTime}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {booking.status === "CONFIRMED" && (
                          <>
                            <button
                              onClick={() => handleComplete(booking.id)}
                              disabled={completeBooking.isPending}
                              className="rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancelBooking.isPending}
                              className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.total > data?.limit && (
              <div className="px-4 py-3 border-t text-sm text-gray-500">
                Showing {bookings.length} of {data.total} bookings
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
