import { MetadataRoute } from "next";
import { prisma } from "@/lib/utils/prisma";

export const dynamic = "force-dynamic";

const CATEGORY_SLUGS = [
  "food", "nightlife", "events", "attractions-tourism",
  "activities-experiences", "courts-sports", "studios-classes",
  "men-care", "women-care", "wellness", "health-care",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const businesses = await prisma.business.findMany({
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...CATEGORY_SLUGS.map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...businesses.map((b) => ({
      url: `${base}/business/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
