import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | BookIt",
  description: "Manage your bookings and account settings.",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
