import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)" }}
    >
      {/* Logo */}
      <Link href="/" className="text-2xl font-extrabold mb-12">
        <span className="text-white">Book</span>
        <span style={{ color: "var(--color-accent)" }}>It</span>
      </Link>

      {/* 404 */}
      <div
        className="text-[120px] md:text-[180px] font-extrabold leading-none mb-4 select-none"
        style={{ color: "var(--color-accent)" }}
      >
        404
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
        Page not found
      </h1>
      <p
        className="text-base md:text-lg max-w-md mb-10"
        style={{ color: "var(--color-text-on-dark-muted)" }}
      >
        We couldn&apos;t find what you were looking for. It may have been moved or deleted.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <Link
          href="/courts-sports"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition-all"
        >
          <Search className="w-4 h-4" />
          Browse Businesses
        </Link>
      </div>
    </div>
  );
}
