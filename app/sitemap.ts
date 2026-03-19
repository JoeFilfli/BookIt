import { MetadataRoute } from "next";
import { prisma } from "@/lib/utils/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const businesses = await prisma.business.findMany({
    select: { slug: true, updatedAt: true },
  });

  const businessUrls = businesses.map((b) => ({
    url: `${base}/business/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/sports`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/salons`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...businessUrls,
  ];
}
