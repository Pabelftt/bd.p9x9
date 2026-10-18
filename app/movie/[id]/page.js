import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import VideoPlayer from "@/components/VideoPlayer";
import SuggestedGrid from "@/components/SuggestedGrid";
import { getMovieById, getSuggestedMovies } from "@/lib/movies";
import { SITE_CONFIG } from "@/lib/config";

export const revalidate = 60; // ISR cache for 60 seconds

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const movie = await getMovieById(id);

  if (!movie) {
    return {
      title: "Video Not Found",
      description: "The requested video could not be found.",
    };
  }

  const canonicalUrl = `${SITE_CONFIG.baseUrl}/movie/${encodeURIComponent(movie.id)}`;

  return {
    title: movie.hadding,
    description: SITE_CONFIG.defaultDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: movie.hadding,
      description: SITE_CONFIG.defaultDescription,
      url: canonicalUrl,
      siteName: SITE_CONFIG.siteName,
      type: "video.other",
      images: [
        {
          url: movie.img || SITE_CONFIG.defaultOgImage,
          width: 1280,
          height: 720,
          alt: movie.hadding,
        },
      ],
    },
    twitter: {
      card: "player",
      title: movie.hadding,
      description: SITE_CONFIG.defaultDescription,
      images: [movie.img || SITE_CONFIG.defaultOgImage],
    },
  };
}

export default async function MoviePage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  const movieDoc = await getMovieById(id);
  if (!movieDoc) {
    notFound();
  }

  const movie = JSON.parse(JSON.stringify(movieDoc));

  // Real-data-only VideoObject structured data for video SEO.
  // Legacy movie documents have no createdAt/updatedAt, but the MongoDB
  // ObjectId embeds the real insertion timestamp of the record.
  const canonicalUrl = `${SITE_CONFIG.baseUrl}/movie/${encodeURIComponent(movie.id)}`;
  const objectIdDate = (() => {
    const hex = typeof movie._id === "string" ? movie._id : "";
    if (!/^[0-9a-fA-F]{24}$/.test(hex)) return null;
    return new Date(parseInt(hex.slice(0, 8), 16) * 1000);
  })();
  const uploadDateRaw = movie.createdAt || movie.updatedAt || objectIdDate;
  const uploadDate = uploadDateRaw && !Number.isNaN(new Date(uploadDateRaw).getTime())
    ? new Date(uploadDateRaw).toISOString()
    : null;
  const posterUrl = movie.img
    ? movie.img.startsWith("http")
      ? movie.img
      : `${SITE_CONFIG.baseUrl}${movie.img.startsWith("/") ? "" : "/"}${movie.img}`
    : SITE_CONFIG.defaultOgImage;
  const videoJsonLd = uploadDate
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: movie.hadding,
        description: SITE_CONFIG.defaultDescription,
        thumbnailUrl: [posterUrl],
        uploadDate,
        url: canonicalUrl,
        embedUrl: canonicalUrl,
        publisher: {
          "@type": "Organization",
          name: SITE_CONFIG.siteName,
          url: SITE_CONFIG.baseUrl,
        },
      }
    : null;

  // Suggested videos
  const suggestedData = await getSuggestedMovies(id, 0, SITE_CONFIG.moviePageSize);
  const suggested = JSON.parse(JSON.stringify(suggestedData.movies || []));
  const hasMoreSuggested = Boolean(suggestedData.hasMore);

  // Check 5-minute smart link cookie on server
  let initialConsented = false;
  try {
    const cookieStore = await cookies();
    const smartCookie = cookieStore.get(SITE_CONFIG.cookieName);
    if (smartCookie && smartCookie.value) {
      const parsed = JSON.parse(decodeURIComponent(smartCookie.value));
      if (parsed.videoId === id) {
        initialConsented = true;
      }
    }
  } catch {}

  return (
    <div className="movie-page-wrap">
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}
      <div className="main-container">
        <VideoPlayer
          movie={movie}
          initialConsented={initialConsented}
          downloadLink={SITE_CONFIG.downloadLinkUrl}
          telegramLink={SITE_CONFIG.telegramUrl}
          description={SITE_CONFIG.defaultDescription}
          moreWebsite={SITE_CONFIG.moreWebsiteUrl}
          redirectUrl={SITE_CONFIG.videoRedirectUrl}
        />

        <SuggestedGrid
          initialSuggested={suggested}
          initialHasMore={hasMoreSuggested}
          excludeId={id}
          moreWebsite={SITE_CONFIG.moreWebsiteUrl}
          telegramLink={SITE_CONFIG.telegramUrl}
        />
      </div>
    </div>
  );
}
