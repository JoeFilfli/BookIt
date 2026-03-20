"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Star, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-surface-dim)" }}>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="skeleton w-80 h-96 rounded-2xl" /></div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (form.password.length < 8) {
          setError("Password must be at least 8 characters");
          setLoading(false); return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      }
      const result = await signIn("credentials", {
        email: form.email, password: form.password, redirect: false,
      });
      if (result?.error) { setError("Invalid email or password"); setLoading(false); return; }
      toast.success(mode === "signup" ? "Account created! Welcome!" : "Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Left panel — desktop only */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)" }}
      >
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold">
          <span className="text-white">Book</span>
          <span style={{ color: "var(--color-accent)" }}>It</span>
        </Link>

        {/* Tagline */}
        <div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Book it.<br />Live it.
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--color-text-on-dark-muted)" }}>
            Lebanon&apos;s all-in-one booking platform for sports, wellness, dining & more.
          </p>
          <div className="space-y-4">
            {[
              { icon: Calendar, text: "Instant bookings — no calls, no waiting" },
              { icon: Star, text: "Thousands of reviewed businesses" },
              { icon: Trophy, text: "From padel courts to spa retreats" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--color-accent-soft)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                </div>
                <span className="text-sm" style={{ color: "var(--color-text-on-dark-muted)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} BookIt
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block text-xl font-extrabold mb-8 text-center">
            <span style={{ color: "var(--color-primary)" }}>Book</span>
            <span style={{ color: "var(--color-accent)" }}>It</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-text-primary">
                {mode === "signin" ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {mode === "signin" ? "Sign in to your BookIt account" : "Join BookIt and start booking"}
              </p>
            </div>

            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-surface-border bg-white text-sm font-semibold text-text-primary hover:bg-surface-dim transition-all mb-4"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-medium text-text-secondary">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Toggle tabs */}
            <div className="flex rounded-xl border border-surface-border p-1 mb-5">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-white shadow-sm text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  style={mode === m ? { backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" } : undefined}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
                  <input
                    name="name" type="text" required={mode === "signup"}
                    value={form.name} onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-surface-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-surface-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-text-primary">Password</label>
                  {mode === "signin" && (
                    <button type="button" className="text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  name="password" type="password" required minLength={8}
                  value={form.password} onChange={handleChange}
                  placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-surface-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
                />
                {mode === "signup" && (
                  <p className="text-xs text-text-secondary mt-1">Minimum 8 characters required</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-sm">
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-base"
                style={{ display: "flex" }}
              >
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-text-secondary">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-text-primary">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
