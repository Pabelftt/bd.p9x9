import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";
import connectDB from "@/lib/db";
import Movie from "@/lib/models/Movie";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.baseUrl;

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    await connectDB();
    const movies = await (Movie as any).find({}, "id").sort({ _id: -1 }).lean();
    for (const movie of movies) {
      if (movie && movie.id) {
        entries.push({
          url: `${baseUrl}/movie/${encodeURIComponent(String(movie.id).trim())}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error("Error generating sitemap entries:", err);
  }

  return entries;
}
