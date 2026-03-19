"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

type ReviewsData = {
  data: Review[];
  totalPages: number;
  averageRating: number;
  totalReviews: number;
};

export default function ReviewsSection({
  businessId,
  initialReviews,
  totalReviews,
  averageRating,
  totalPages: initialTotalPages,
}: {
  businessId: string;
  initialReviews: Review[];
  totalReviews: number;
  averageRating: number;
  totalPages: number;
}) {
  const [page, setPage] = useState(1);

  const { data } = useQuery<ReviewsData>({
    queryKey: ["reviews", businessId, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/businesses/${businessId}/reviews?page=${page}&limit=10`
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    initialData:
      page === 1
        ? {
            data: initialReviews,
            totalPages: initialTotalPages,
            averageRating,
            totalReviews,
          }
        : undefined,
    staleTime: 30 * 1000,
  });

  const reviews = data?.data ?? initialReviews;
  const totalPagesResolved = data?.totalPages ?? initialTotalPages;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        {totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="text-sm font-medium text-gray-900">
              {averageRating}
            </span>
            <span className="text-sm text-gray-500">({totalReviews})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-gray-500">No reviews yet</p>
      ) : (
        <>
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                    {review.user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.user.name}
                    </p>
                    <StarRating rating={review.rating} />
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>

          {totalPagesResolved > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPagesResolved}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPagesResolved, p + 1))}
                disabled={page === totalPagesResolved}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
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
