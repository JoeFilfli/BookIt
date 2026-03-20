"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  count?: number;
}

export function StarRating({
  rating,
  max = 5,
  interactive = false,
  onChange,
  size = "sm",
  showNumber = false,
  count,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0);

  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const textClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];

  const displayed = interactive && hovered > 0 ? hovered : rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= Math.round(displayed);
        return (
          <Star
            key={i}
            className={`${sizeClass} transition-colors ${
              filled
                ? "fill-[color:var(--color-star)] text-[color:var(--color-star)]"
                : "fill-transparent text-surface-border"
            } ${interactive ? "cursor-pointer" : ""}`}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
      {showNumber && (
        <span className={`font-semibold text-text-primary ${textClass}`}>
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      )}
      {count !== undefined && (
        <span className={`text-text-secondary ${textClass}`}>
          ({count})
        </span>
      )}
    </div>
  );
}
