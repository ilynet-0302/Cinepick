import {
  Bookmark,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Heart,
  Play,
  Share2,
  Star,
} from "lucide-react";
import { useLibrary } from "../../features/library/useLibrary";
import type { Movie } from "../../types";

interface MovieHeroProps {
  movie: Movie;
  onBack: () => void;
}

export function MovieHero({ movie, onBack }: MovieHeroProps) {
  const library = useLibrary();
  return (
    <section
      className="detail-hero"
      style={{ "--detail-bg": `url(${movie.backdrop})` } as React.CSSProperties}
    >
      <button className="back-btn" onClick={onBack}>
        <ChevronLeft size={18} /> Back
      </button>
      <div className="detail-content">
        <img
          className="detail-poster"
          src={movie.poster}
          alt={`${movie.title} poster`}
        />
        <div className="detail-copy">
          <div className="hero-badges">
            <span className="badge accent">
              {movie.type === "movie" ? "Movie" : "Series"}
            </span>
            <span className="badge">
              <Star size={13} fill="currentColor" /> {movie.rating}
            </span>
          </div>
          <h1>{movie.title}</h1>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="original-title">{movie.originalTitle}</p>
          )}
          <div className="detail-meta">
            <span>
              <CalendarDays size={16} /> {movie.year}
            </span>
            <span>
              <Clock3 size={16} /> {movie.runtime} min
            </span>
            <span>{movie.genres.join(" · ")}</span>
          </div>
          <p className="detail-overview">{movie.overview}</p>
          <p className="director-line">
            <span>Directed by</span> {movie.director}
          </p>
          <div className="detail-actions">
            <a
              className="primary-btn"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} official trailer`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={17} fill="currentColor" /> Watch trailer
            </a>
            <button
              aria-label="Toggle watchlist"
              className={
                library.inList("watchlist", movie)
                  ? "round-action active"
                  : "round-action"
              }
              onClick={() => library.toggle("watchlist", movie)}
            >
              <Bookmark
                size={19}
                fill={
                  library.inList("watchlist", movie) ? "currentColor" : "none"
                }
              />
            </button>
            <button
              aria-label="Toggle favorite"
              className={
                library.inList("favorite", movie)
                  ? "round-action active"
                  : "round-action"
              }
              onClick={() => library.toggle("favorite", movie)}
            >
              <Heart
                size={19}
                fill={
                  library.inList("favorite", movie) ? "currentColor" : "none"
                }
              />
            </button>
            <button
              aria-label="Copy link"
              className="round-action"
              onClick={() =>
                navigator.clipboard?.writeText(window.location.href)
              }
            >
              <Share2 size={19} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
