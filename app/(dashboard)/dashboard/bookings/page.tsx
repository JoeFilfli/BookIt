"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useBusinessBookings, useResources, useCancelBooking, useCompleteBooking } from "@/lib/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, CheckCircle, X, Filter } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    CONFIRMED: { label: "Confirmed", bg: "rgba(16,185,129,0.1)", color: "var(--color-success)" },
    COMPLETED: { label: "Completed", bg: "var(--color-surface-border)", color: "var(--color-text-secondary)" },
    CANCELLED: { label: "Cancelled", bg: "rgba(239,68,68,0.1)", color: "var(--color-error)" },
  };
  const c = config[status] ?? config.COMPLETED;
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

interface Booking {
  id: string; date: string; startTime: string; endTime: string; status: string;
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

  const { data: businessData } = useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await fetch("/api/businesses/my");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed");
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
      <div className="space-y-4">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">You need to create a business first.</p>
        <Link href="/dashboard/create" className="btn-primary">Create Business</Link>
      </div>
    );
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled."); refetch();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      await completeBooking.mutateAsync(bookingId);
      toast.success("Marked as complete!"); refetch();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const hasFilters = statusFilter || resourceFilter || dateFilter;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Bookings</h1>
        <p className="text-text-secondary text-sm mt-0.5">All customer bookings for your business.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-text-secondary" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-surface-border text-sm text-text-primary bg-white focus:outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-surface-border text-sm text-text-primary bg-white focus:outline-none focus:border-accent"
        >
          <option value="">All Resources</option>
          {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-surface-border text-sm text-text-primary bg-white focus:outline-none focus:border-accent"
        />
        {hasFilters && (
          <button
            onClick={() => { setStatusFilter(""); setResourceFilter(""); setDateFilter(""); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-error border border-error/30 hover:bg-error/5"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-text-secondary font-medium">
          {data?.total ?? 0} bookings
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
          <CalendarDays className="w-12 h-12 text-text-secondary opacity-30 mb-3" />
          <h3 className="font-bold text-text-primary mb-1">No bookings found</h3>
          <p className="text-sm text-text-secondary">
            {hasFilters ? "Try clearing your filters." : "Bookings will appear here once customers start booking."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--color-surface-dim)" }}>
                  {["Customer", "Service", "Resource", "Date & Time", "Total", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-dim transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-text-primary">{booking.user.name}</div>
                      <div className="text-xs text-text-secondary">{booking.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-primary">{booking.service.name}</div>
                      <div className="text-xs text-text-secondary">{booking.service.durationMinutes}min</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{booking.resource.name}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-primary whitespace-nowrap">
                        {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="text-xs text-text-secondary">{booking.startTime} – {booking.endTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-text-primary">${Number(booking.totalPrice).toFixed(2)}</div>
                      <div className="text-xs text-text-secondary">{booking.service.currency}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === "CONFIRMED" && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleComplete(booking.id)}
                            disabled={completeBooking.isPending}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Complete
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelBooking.isPending}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--color-error)" }}
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.total > data?.limit && (
            <div className="px-4 py-3 border-t border-surface-border text-xs text-text-secondary">
              Showing {bookings.length} of {data.total} bookings
            </div>
          )}
        </div>
      )}
    </div>
  );
}
