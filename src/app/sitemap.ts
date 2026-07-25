import type { MetadataRoute } from "next";
import { getCourses } from "@/lib/api/courses";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chainlearn.netlify.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/connect`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let courseRoutes: MetadataRoute.Sitemap = [];

  try {
    const result = await getCourses();
    courseRoutes = result.data.map((course) => ({
      url: `${SITE_URL}/courses/${course.id}`,
      lastModified: new Date(course.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Catalog may be unavailable at build time; still ship static routes.
  }

  return [...staticRoutes, ...courseRoutes];
}
