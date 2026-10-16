import Link from "next/link";
import { StarIcon, PlayIcon } from "./icons/Icons";

export default function MovieCard({ movie, priority = false }) {
  if (!movie) return null;

  // Stable pseudo-random rating based on movie id
  const rating = (() => {
    let hash = 0;
    const str = String(movie.id || "0");
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const val = 8.0 + (Math.abs(hash) % 19) / 10;
    return val.toFixed(1);
  })();

  return (
    <article className="movie-card">
      <Link
        href={`/movie/${encodeURIComponent(movie.id)}`}
        className="card-link"
        aria-label={`Watch ${movie.hadding}`}
      >
        <div className="thumbnail-wrapper">
          <img
            src={movie.img || "/placeholder.png"}
            alt={movie.hadding}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="thumbnail-img"
          />

          <div className="card-badges">
            <span className="badge-hd">HD</span>
            <span className="badge-rating">
              <StarIcon size={12} />
              <span>{rating}</span>
            </span>
          </div>

          <div className="play-overlay">
            <div className="play-circle">
              <PlayIcon size={22} />
            </div>
          </div>
        </div>

        <div className="card-info">
          <h3 className="card-title" title={movie.hadding}>
            {movie.hadding}
          </h3>
        </div>
      </Link>
    </article>
  );
}
