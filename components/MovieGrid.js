"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MovieCard from "./MovieCard";
import { ChevronDownIcon, SearchIcon } from "./icons/Icons";

export default function MovieGrid({ initialMovies = [], initialHasMore = false, query = "" }) {
  const [movies, setMovies] = useState(initialMovies);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prevInitialMovies, setPrevInitialMovies] = useState(initialMovies);

  // Synchronize state when initialMovies change from server navigation without effect cascading
  if (initialMovies !== prevInitialMovies) {
    setPrevInitialMovies(initialMovies);
    setMovies(initialMovies);
    setHasMore(initialHasMore);
    setError(null);
  }

  const observerRef = useRef(null);
  const loadTriggerRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        skip: String(movies.length),
      });
      if (query) {
        params.set("q", query);
      }

      const res = await fetch(`/api/movies?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load movies: ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.movies)) {
        setMovies((prev) => [...prev, ...data.movies]);
        setHasMore(Boolean(data.hasMore));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more movies:", err);
      setError("Failed to load more videos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, movies.length, query]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "450px 0px" }
    );

    const el = loadTriggerRef.current;
    if (el) observerRef.current.observe(el);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, loadMore]);

  return (
    <section className="feed-section" aria-label="Videos Feed">
      <div className="main-container">
        {query && (
          <div className="search-banner" role="status">
            <span className="search-banner-icon">
              <SearchIcon size={18} />
            </span>
            <div className="search-banner-text">
              <span className="search-banner-label">Search results for:</span>
              <strong className="search-banner-query">&ldquo;{query}&rdquo;</strong>
              <span className="search-banner-count">({movies.length} videos)</span>
            </div>
          </div>
        )}

        {movies.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <SearchIcon size={36} />
            </div>
            <h3 className="empty-title">No Videos Found</h3>
            <p className="empty-desc">
              {query
                ? `No videos matched "${query}". Please try a different search.`
                : "No videos are currently available."}
            </p>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${index}`}
                movie={movie}
                priority={index === 0}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="load-more-container" ref={loadTriggerRef}>
            <button
              type="button"
              className="load-more-btn"
              onClick={loadMore}
              disabled={loading}
              aria-label={loading ? "Loading more videos..." : "Load more videos"}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  <span>Loading videos...</span>
                </>
              ) : (
                <>
                  <span>Load More Videos</span>
                  <ChevronDownIcon size={18} />
                </>
              )}
            </button>
            {error && <p className="load-error">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
