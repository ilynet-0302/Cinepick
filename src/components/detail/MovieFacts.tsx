import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useLibrary } from "../../features/library/useLibrary";
import type { Movie } from "../../types";
import { mediaKey } from "../../utils/mediaKey";

export function MovieFacts({ movie }: { movie: Movie }) {
  const library = useLibrary();
  const key = mediaKey(movie);
  return (
    <aside className="facts-panel">
      <h3>Details</h3>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>Released</dd>
        </div>
        <div>
          <dt>Original language</dt>
          <dd>{movie.language.toUpperCase()}</dd>
        </div>
        <div>
          <dt>Country</dt>
          <dd>{movie.country}</dd>
        </div>
        <div>
          <dt>Studio</dt>
          <dd>{movie.studio}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>${Math.round((movie.budget || 0) / 1_000_000)}M</dd>
        </div>
        <div>
          <dt>Revenue</dt>
          <dd>${Math.round((movie.revenue || 0) / 1_000_000)}M</dd>
        </div>
      </dl>
      <div className="progress-control">
        <label>
          <span>Viewing progress</span>
          <b>{library.progress[key] || 0}%</b>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={library.progress[key] || 0}
          onChange={(event) =>
            library.setProgress(movie, Number(event.target.value))
          }
        />
        <small>
          {library.cloudLoading
            ? "Syncing…"
            : "Move the slider to track progress"}
        </small>
      </div>
      <button
        className={
          library.inList("watched", movie)
            ? "watched-button active"
            : "watched-button"
        }
        onClick={() => library.toggle("watched", movie)}
      >
        <Check size={18} />{" "}
        {library.inList("watched", movie) ? "Watched" : "Mark as watched"}
      </button>
      <Link to={`/compare?a=${key}`} className="compare-link">
        Compare this title →
      </Link>
    </aside>
  );
}
