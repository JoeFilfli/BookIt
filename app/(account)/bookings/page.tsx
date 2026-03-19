"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useUserBookings, useCancelBooking, useCreateReview } from "@/lib/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { BookingCardSkeleton } from "@/app/components/Skeletons";

type Tab = "upcoming" | "past";

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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none"
        >
          <span className={(hovered || value) >= star ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4 space-y-3">
      <p className="text-sm font-medium text-gray-700">Leave a Review</p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Share your experience (optional)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={createReview.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {createReview.isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: string;
  resource: {
    name: string;
    type: string;
    business: { name: string; slug: string };
  };
  service: { name: string; durationMinutes: number; currency: string };
  review: { id: string } | null;
}

export default function CustomerBookingsPage() {
  const { status: authStatus } = useSession();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelError, setCancelError] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch } = useUserBookings({
    upcoming: tab === "upcoming",
  });

  const cancelBooking = useCancelBooking();
  const bookings: Booking[] = data?.data || [];

  if (authStatus === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign in required</h1>
          <Link
            href="/login?callbackUrl=/bookings"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking? The time slot will be freed for others.")) return;
    setCancelError("");
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled.");
      refetch();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel");
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {cancelError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {cancelError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit mb-6">
          {(["upcoming", "past"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">
              {tab === "upcoming" ? "No upcoming bookings." : "No past bookings."}
            </p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm">
              Browse businesses
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const hasReview = booking.review || reviewedIds.has(booking.id);
              return (
                <div key={booking.id} className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {booking.resource.business.name}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {booking.service.name} · {booking.resource.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {booking.startTime} – {booking.endTime}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900">
                        ${Number(booking.totalPrice).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">{booking.service.currency}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Link
                      href={`/business/${booking.resource.business.slug}`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Business
                    </Link>

                    {booking.status === "CONFIRMED" && tab === "upcoming" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelBooking.isPending}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {booking.status === "COMPLETED" && !hasReview && reviewingId !== booking.id && (
                      <button
                        onClick={() => setReviewingId(booking.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Leave Review
                      </button>
                    )}

                    {booking.status === "COMPLETED" && hasReview && (
                      <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
                        ★ Review submitted
                      </span>
                    )}
                  </div>

                  {/* Inline review form */}
                  {reviewingId === booking.id && !hasReview && (
                    <ReviewForm
                      bookingId={booking.id}
                      onSuccess={() => {
                        setReviewingId(null);
                        setReviewedIds((prev) => new Set(prev).add(booking.id));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
