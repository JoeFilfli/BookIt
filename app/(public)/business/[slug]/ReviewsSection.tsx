"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

type Review = {
  id: string; rating: number; comment: string | null;
  createdAt: string; user: { id: string; name: string; avatarUrl: string | null };
};

type ReviewsData = {
  data: Review[]; totalPages: number; averageRating: number; totalReviews: number;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-star text-star" : "fill-transparent text-surface-border"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  businessId, initialReviews, totalReviews, averageRating, totalPages: initPages,
}: {
  businessId: string; initialReviews: Review[]; totalReviews: number;
  averageRating: number; totalPages: number;
}) {
  const [page, setPage] = useState(1);

  const { data } = useQuery<ReviewsData>({
    queryKey: ["reviews", businessId, page],
    queryFn: async () => {
      const res = await fetch(`/api/businesses/${businessId}/reviews?page=${page}&limit=10`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    initialData: page === 1
      ? { data: initialReviews, totalPages: initPages, averageRating, totalReviews }
      : undefined,
    staleTime: 30_000,
  });

  const reviews = data?.data ?? initialReviews;
  const totalPagesResolved = data?.totalPages ?? initPages;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm" id="reviews">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Reviews</h2>
        {totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-star text-star" />
            <span className="text-lg font-bold text-text-primary">{averageRating}</span>
            <span className="text-sm text-text-secondary">({totalReviews} reviews)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-text-secondary text-sm">No reviews yet. Be the first to leave one!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-surface-border last:border-0">
                <div className="flex items-start gap-3">
                  {review.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.user.avatarUrl}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: "var(--color-secondary)" }}
                    >
                      {review.user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-semibold text-text-primary text-sm">{review.user.name}</span>
                      <span className="text-xs text-text-secondary">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                    </div>
                    <Stars rating={review.rating} />
                    {review.comment && (
                      <p className="mt-2 text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPagesResolved > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-surface-border text-sm font-medium text-text-primary hover:bg-surface-dim disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-text-secondary">
                Page {page} of {totalPagesResolved}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPagesResolved, p + 1))}
                disabled={page === totalPagesResolved}
                className="px-4 py-2 rounded-lg border border-surface-border text-sm font-medium text-text-primary hover:bg-surface-dim disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
