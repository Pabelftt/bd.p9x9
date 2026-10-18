import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";
import connectDB from "@/lib/db";
import Movie from "@/lib/models/Movie";

// Cached via ISR so crawlers get a fast response even when the database
// connection is slow or cold. The sitemap is still generated dynamically
// from MongoDB (with timeout + error handling) and refreshes hourly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/+$/, "");

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    await connectDB({ serverSelectionTimeoutMS: 5000 });
    const movies = await (Movie as any).find({}, "id updatedAt createdAt")
      .sort({ _id: -1 })
      .maxTimeMS(5000)
      .lean();
    for (const movie of movies) {
      const id = String(movie?.id || "").trim();
      if (!id) continue;

      const entry: MetadataRoute.Sitemap[number] = {
        url: `${baseUrl}/movie/${encodeURIComponent(id)}`,
        changeFrequency: "daily",
        priority: 0.7,
      };
      const modifiedAt = movie.updatedAt || movie.createdAt;
      const lastModified = modifiedAt ? new Date(modifiedAt) : null;
      if (lastModified && Number.isFinite(lastModified.getTime())) {
        entry.lastModified = lastModified;
      }
      entries.push(entry);
    }
  } catch (err) {
    console.error("Error generating sitemap entries:", err);
  }

  return entries;
}
