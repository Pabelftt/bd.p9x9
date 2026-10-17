"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MovieCard from "./MovieCard";
import { ChevronDownIcon, GlobeIcon, TelegramIcon } from "./icons/Icons";

export default function SuggestedGrid({
  initialSuggested = [],
  initialHasMore = false,
  excludeId = "",
  moreWebsite = "https://p9x9.com",
  telegramLink = "https://telegram.p9x9.com/telegram",
}) {
  const [movies, setMovies] = useState(initialSuggested);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prevInitial, setPrevInitial] = useState(initialSuggested);

  if (initialSuggested !== prevInitial) {
    setPrevInitial(initialSuggested);
    setMovies(initialSuggested);
    setHasMore(initialHasMore);
    setError(null);
  }

  const observerRef = useRef(null);
  const triggerRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        excludeId: String(excludeId),
        skip: String(movies.length),
      });

      const res = await fetch(`/api/suggested?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load suggestions");

      const data = await res.json();
      if (Array.isArray(data.movies)) {
        setMovies((prev) => [...prev, ...data.movies]);
        setHasMore(Boolean(data.hasMore));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading suggestions:", err);
      setError("Failed to load suggested videos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, excludeId, movies.length]);

  useEffect(() => {
    if (!hasMore || loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px 0px" }
    );

    const el = triggerRef.current;
    if (el) observerRef.current.observe(el);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, loadMore]);

  return (
    <section className="suggested-section" aria-label="Suggested Videos">
      <div className="section-header">
        <h2 className="section-title">Suggested Videos</h2>
        <span className="section-subtitle">More related hot clips for you</span>
      </div>

      <div className="movies-grid">
        {movies.map((movie, index) => (
          <MovieCard key={`${movie.id}-${index}`} movie={movie} />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-wrap" ref={triggerRef}>
          <button
            type="button"
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <span>See More Videos</span>
                <ChevronDownIcon size={18} />
              </>
            )}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>
      )}

      {/* Network Links Section */}
      <div className="other-websites-box">
        <h3 className="network-title">Explore More Channels & Content</h3>
        <p className="network-subtitle">Visit our official partner websites and communities</p>
        <div className="network-actions">
          <a
            href={moreWebsite}
            className="network-pill pill-p9x9"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GlobeIcon size={18} />
            <span>P9X9.COM</span>
          </a>

          <a
            href={telegramLink}
            className="network-pill pill-tg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TelegramIcon size={18} />
            <span>Join Telegram</span>
          </a>
        </div>
      </div>
    </section>
  );
}
