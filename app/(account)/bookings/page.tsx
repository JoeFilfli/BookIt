"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useUserBookings, useCancelBooking, useCreateReview } from "@/lib/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, Clock, Star, Building2, CheckCircle, X } from "lucide-react";
import { StarRating, Modal } from "@/app/components/ui";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";

type Tab = "upcoming" | "past" | "cancelled";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: string;
  resource: { name: string; type: string; business: { name: string; slug: string } };
  service: { name: string; durationMinutes: number; currency: string };
  review: { id: string } | null;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    CONFIRMED: { label: "Confirmed", bg: "rgba(16,185,129,0.1)", color: "var(--color-success)" },
    COMPLETED: { label: "Completed", bg: "var(--color-surface-border)", color: "var(--color-text-secondary)" },
    CANCELLED: { label: "Cancelled", bg: "rgba(239,68,68,0.1)", color: "var(--color-error)" },
  };
  const c = config[status] ?? config.COMPLETED;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function ReviewModal({
  bookingId, open, onClose, onSuccess,
}: {
  bookingId: string; open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    setError("");
    try {
      await createReview.mutateAsync({ bookingId, rating, comment: comment || undefined });
      toast.success("Review submitted!");
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setError(msg); toast.error(msg);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Leave a Review">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Your Rating</label>
          <StarRating rating={rating} interactive onChange={setRating} size="lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience..."
            className="w-full rounded-xl border-2 border-surface-border px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button
          type="submit"
          disabled={createReview.isPending}
          className="btn-primary w-full justify-center"
          style={{ display: "flex" }}
        >
          {createReview.isPending ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </Modal>
  );
}

export default function CustomerBookingsPage() {
  const { status: authStatus } = useSession();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch } = useUserBookings({
    upcoming: tab === "upcoming",
    status: tab === "cancelled" ? "CANCELLED" : tab === "past" ? "COMPLETED" : undefined,
  });

  const cancelBooking = useCancelBooking();
  const bookings: Booking[] = data?.data || [];

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="skeleton w-80 h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-xl font-bold text-text-primary mb-2">Sign in required</h1>
            <p className="text-text-secondary mb-6">You need to sign in to view your bookings.</p>
            <Link href="/login?callbackUrl=/bookings" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking? The slot will be freed for others.")) return;
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled.");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-text-primary">My Bookings</h1>
            <p className="text-text-secondary mt-1">Manage all your bookings in one place.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-surface-border">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                  tab === key
                    ? "border-b-2 text-accent"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
                style={tab === key ? { borderColor: "var(--color-accent)" } : undefined}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-32 rounded-2xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarDays className="w-12 h-12 text-text-secondary opacity-30 mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-1">
                No {tab} bookings
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                {tab === "upcoming"
                  ? "Find something to book and it will show up here."
                  : "Your past bookings will appear here."}
              </p>
              {tab === "upcoming" && (
                <Link href="/" className="btn-primary text-sm">
                  Browse Businesses
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const hasReview = booking.review || reviewedIds.has(booking.id);
                return (
                  <div key={booking.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Business info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-text-primary">
                            {booking.resource.business.name}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="text-sm text-text-secondary">
                          {booking.service.name} · {booking.resource.name}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary flex-wrap">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              weekday: "short", year: "numeric", month: "short", day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {booking.startTime} – {booking.endTime}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <div className="text-lg font-extrabold text-text-primary">
                          ${Number(booking.totalPrice).toFixed(2)}
                        </div>
                        <div className="text-xs text-text-secondary">{booking.service.currency}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap mt-4 pt-3 border-t border-surface-border">
                      <Link
                        href={`/business/${booking.resource.business.slug}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-dim transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        View Business
                      </Link>

                      {booking.status === "CONFIRMED" && tab === "upcoming" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelBooking.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50"
                          style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--color-error)" }}
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}

                      {booking.status === "COMPLETED" && !hasReview && (
                        <button
                          onClick={() => setReviewingId(booking.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-[0.98]"
                          style={{ backgroundColor: "var(--color-accent)" }}
                        >
                          <Star className="w-3.5 h-3.5" />
                          Leave Review
                        </button>
                      )}

                      {booking.status === "COMPLETED" && hasReview && (
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-success">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Review Modal */}
      <ReviewModal
        bookingId={reviewingId ?? ""}
        open={!!reviewingId}
        onClose={() => setReviewingId(null)}
        onSuccess={() => setReviewedIds((prev) => new Set(prev).add(reviewingId!))}
      />
    </div>
  );
}
