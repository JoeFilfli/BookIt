import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Dashboard | BookIt",
  description: "Manage your business, services, resources, and bookings.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
