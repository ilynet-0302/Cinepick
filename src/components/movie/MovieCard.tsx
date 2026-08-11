import { Bookmark, Check, Heart, ImageOff, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLibrary } from "../../features/library/useLibrary";
import type { Movie } from "../../types";

interface MovieCardProps {
  movie: Movie;
  rank?: number;
  compact?: boolean;
}

export function MovieCard({ movie, rank, compact = false }: MovieCardProps) {
  const library = useLibrary();
  const [imageError, setImageError] = useState(false);
  return (
    <article className={`movie-card ${compact ? "compact" : ""}`}>
      {rank && <span className="rank">{String(rank).padStart(2, "0")}</span>}
      <Link
        to={`/${movie.type}/${movie.id}`}
        className="poster-wrap"
        aria-label={`View ${movie.title}`}
      >
        {movie.poster && !imageError ? (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="poster-fallback">
            <ImageOff size={30} />
            <span>{movie.title}</span>
          </div>
        )}
        <span className="rating-pill">
          <Star size={13} fill="currentColor" /> {movie.rating.toFixed(1)}
        </span>
        <div className="card-overlay">
          <p>{movie.overview}</p>
          <span>View details</span>
        </div>
      </Link>
      <div className="card-info">
        <div className="card-heading">
          <Link to={`/${movie.type}/${movie.id}`}>{movie.title}</Link>
          <span>{movie.year}</span>
        </div>
        <p className="genre-line">{movie.genres.slice(0, 2).join(" · ")}</p>
        <div className="quick-actions">
          <button
            className={library.inList("favorite", movie) ? "selected" : ""}
            onClick={() => library.toggle("favorite", movie)}
            title="Favorite"
            aria-label="Toggle favorite"
          >
            <Heart
              size={17}
              fill={library.inList("favorite", movie) ? "currentColor" : "none"}
            />
          </button>
          <button
            className={library.inList("watchlist", movie) ? "selected" : ""}
            onClick={() => library.toggle("watchlist", movie)}
            title="Watchlist"
            aria-label="Toggle watchlist"
          >
            <Bookmark
              size={17}
              fill={
                library.inList("watchlist", movie) ? "currentColor" : "none"
              }
            />
          </button>
          <button
            className={
              library.inList("watched", movie) ? "selected watched" : ""
            }
            onClick={() => library.toggle("watched", movie)}
            title="Mark as watched"
            aria-label="Toggle watched"
          >
            <Check size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
