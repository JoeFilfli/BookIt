import type { Metadata } from "next";
import { prisma } from "@/lib/utils/prisma";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const business = await prisma.business.findFirst({
    where: { slug },
    select: { name: true, description: true, category: true },
  });

  if (!business) {
    return { title: "Business Not Found | BookIt" };
  }

  const categoryLabel = business.category === "SPORTS" ? "Sports Facility" : "Salon";

  return {
    title: `${business.name} | BookIt`,
    description:
      business.description ||
      `Book ${categoryLabel.toLowerCase()} services at ${business.name} on BookIt.`,
    openGraph: {
      title: `${business.name} | BookIt`,
      description:
        business.description ||
        `Book ${categoryLabel.toLowerCase()} services at ${business.name} on BookIt.`,
      type: "website",
    },
  };
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
