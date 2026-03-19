import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | BookIt",
  description: "Sign in to BookIt to manage your bookings or business.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
