import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";
import connectDB from "@/lib/db";
import Movie from "@/lib/models/Movie";
import { formatEnglishTitle } from "@/lib/movies";

// Always generated at request time so the sitemap can never be baked
// incomplete during the build (the build environment may not reach MongoDB).
// A small in-memory cache keeps responses fast for crawlers.
export const dynamic = "force-dynamic";

const FULL_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MIN_MOVIE_ENTRIES = 10;

type SitemapCache = {
  entries: MetadataRoute.Sitemap;
  timestamp: number;
};

// Next.js interpolates video sitemap fields into the XML document without
// escaping them, so a raw "&" or "<" from a scraped title would make the
// whole sitemap unparsable for Google. Normalize entities, then escape.
function escapeXmlText(value: unknown): string {
  return String(value ?? "")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function makeAbsolute(url: unknown, baseUrl: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

async function buildSitemapEntries() {
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

  let dbSucceeded = false;

  try {
    await connectDB({ serverSelectionTimeoutMS: 5000 });
    const movies = await (Movie as any)
      .find({}, "id hadding img updatedAt createdAt")
      .sort({ _id: -1 })
      .maxTimeMS(5000)
      .lean();
    dbSucceeded = true;

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

      // Real video metadata for Google video indexing (title, thumbnail and
      // description match what visitors see on the movie page).
      const thumbnail = makeAbsolute(movie?.img, baseUrl);
      if (thumbnail) {
        entry.videos = [
          {
            title: escapeXmlText(formatEnglishTitle(movie?.hadding, id)),
            thumbnail_loc: escapeXmlText(thumbnail),
            description: escapeXmlText(SITE_CONFIG.defaultDescription),
          },
        ];
      }

      entries.push(entry);
    }
  } catch (err) {
    console.error("Error generating sitemap entries:", err);
  }

  return { entries, dbSucceeded };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cacheHost = globalThis as unknown as { __p9x9SitemapCache?: SitemapCache };
  const cached = cacheHost.__p9x9SitemapCache;

  if (cached && cached.entries && Date.now() - cached.timestamp < FULL_CACHE_TTL_MS) {
    return cached.entries;
  }

  const { entries, dbSucceeded } = await buildSitemapEntries();

  // Only a complete (database-backed) result may be cached, so a temporary
  // database failure can never be frozen into the sitemap. If the database
  // failed, prefer a previously cached complete result; otherwise fall back
  // to the static pages and retry on the next request.
  if (dbSucceeded && entries.length > MIN_MOVIE_ENTRIES) {
    cacheHost.__p9x9SitemapCache = { entries, timestamp: Date.now() };
    return entries;
  }

  if (cached && cached.entries?.length > MIN_MOVIE_ENTRIES) {
    return cached.entries;
  }

  return entries;
}
