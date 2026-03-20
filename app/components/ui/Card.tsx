import React from "react";

type CardVariant = "default" | "dark";

interface CardProps {
  variant?: CardVariant;
  hover?: boolean;
  clickable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  hover = false,
  clickable = false,
  className = "",
  children,
}: CardProps) {
  const base =
    variant === "dark"
      ? "bg-primary-light text-white rounded-xl shadow-sm"
      : "bg-white text-text-primary rounded-xl shadow-sm";

  return (
    <div
      className={`
        ${base}
        ${hover ? "card-hover" : ""}
        ${clickable ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
