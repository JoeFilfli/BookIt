"use client";

import React from "react";
import { Search } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  searchVariant?: boolean;
}

export function Input({
  label,
  error,
  helper,
  searchVariant = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {searchVariant && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-text-primary
            placeholder:text-text-secondary
            border-surface-border
            focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${searchVariant ? "pl-9" : ""}
            ${error ? "border-error focus:ring-error/30 focus:border-error" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {!error && helper && (
        <p className="text-xs text-text-secondary">{helper}</p>
      )}
    </div>
  );
}
