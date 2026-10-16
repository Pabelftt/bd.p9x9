import LatestRail from "@/components/LatestRail";
import MovieGrid from "@/components/MovieGrid";
import { getMoviePage, getLatestMovies } from "@/lib/movies";
import { SITE_CONFIG } from "@/lib/config";

export const revalidate = 60; // ISR cache for 60 seconds

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q ? String(resolvedSearchParams.q).trim() : "";

  if (q) {
    return {
      title: `"${q}" Search Results`,
      description: `Watch trending videos matching "${q}" on BD.P9X9. Free instant streaming in high definition.`,
      alternates: {
        canonical: `${SITE_CONFIG.baseUrl}/?q=${encodeURIComponent(q)}`,
      },
    };
  }

  return {
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    alternates: {
      canonical: SITE_CONFIG.baseUrl,
    },
  };
}

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q ? String(resolvedSearchParams.q).trim() : "";

  let movies = [];
  let hasMore = false;
  let latest = [];

  try {
    const movieData = await getMoviePage(query, 0, SITE_CONFIG.moviePageSize);
    movies = JSON.parse(JSON.stringify(movieData.movies || []));
    hasMore = Boolean(movieData.hasMore);

    if (!query) {
      const latestData = await getLatestMovies(5);
      latest = JSON.parse(JSON.stringify(latestData || []));
    }
  } catch (error) {
    console.error("Error fetching homepage movies:", error);
  }

  return (
    <div className="homepage-wrap">
      {!query && latest.length > 0 && <LatestRail items={latest} />}
      <MovieGrid
        initialMovies={movies}
        initialHasMore={hasMore}
        query={query}
      />
    </div>
  );
}
