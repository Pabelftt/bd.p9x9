import Link from "next/link";
import { FireIcon, PlayIcon } from "./icons/Icons";

export default function LatestRail({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="latest-section" aria-labelledby="latest-heading">
      <div className="main-container">
        <div className="section-header">
          <div className="header-tag">
            <span className="fire-icon-wrapper">
              <FireIcon size={16} />
            </span>
            <h2 id="latest-heading" className="section-title">
              Latest Additions
            </h2>
          </div>
          <span className="section-subtitle">Newly added trending videos</span>
        </div>

        <div className="latest-rail">
          {items.map((item, idx) => (
            <Link
              key={item.id || idx}
              href={`/movie/${encodeURIComponent(item.id)}`}
              className="latest-item"
              aria-label={`Watch latest addition: ${item.hadding}`}
            >
              <div className="item-thumb-wrapper">
                <img
                  src={item.img || "/placeholder.png"}
                  alt={item.hadding}
                  loading="lazy"
                  decoding="async"
                  className="item-thumb"
                />
                <div className="play-badge">
                  <PlayIcon size={14} />
                </div>
              </div>
              <span className="item-title">{item.hadding}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
