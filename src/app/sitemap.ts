import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://careers.stressfreeautocare.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [openJobs, locations] = await Promise.all([
    prisma.job.findMany({
      where: { status: "OPEN" },
      select: { id: true, updatedAt: true },
      orderBy: { postedAt: "desc" },
    }),
    prisma.location.findMany({
      select: { slug: true, createdAt: true },
      orderBy: { city: "asc" },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/why-stress-free`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/benefits`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/growth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const jobRoutes: MetadataRoute.Sitemap = openJobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const locationRoutes: MetadataRoute.Sitemap = locations.map((loc) => ({
    url: `${BASE_URL}/locations/${loc.slug}`,
    lastModified: loc.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...jobRoutes, ...locationRoutes];
}
