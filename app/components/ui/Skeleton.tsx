import React from "react";

type SkeletonVariant = "card" | "text-line" | "avatar" | "image" | "custom";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  lines?: number;
}

export function Skeleton({
  variant = "custom",
  className = "",
  lines = 3,
}: SkeletonProps) {
  if (variant === "card") {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="skeleton h-48 w-full rounded-none" />
        <div className="p-4 space-y-3">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === "text-line") {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return <div className="skeleton rounded-full w-10 h-10" />;
  }

  if (variant === "image") {
    return <div className={`skeleton rounded-xl ${className}`} />;
  }

  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return <Skeleton variant="card" />;
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
