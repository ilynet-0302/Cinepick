import { X } from "lucide-react";
import { LoadingGrid } from "../../components/movie/LoadingGrid";
import { MovieCard } from "../../components/movie/MovieCard";
import { genres } from "../../data/genres";
import type { Movie } from "../../types";

interface DiscoverResultsProps {
  titles: Movie[];
  activeGenre: string;
  hasActiveFilters: boolean;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onGenreChange: (genre: string) => void;
  onReset: () => void;
  onRetry: () => void;
  onLoadMore: () => void;
}

export function DiscoverResults(props: DiscoverResultsProps) {
  return (
    <div className="discover-results">
      <div className="genre-chips">
        {genres.map((genre) => (
          <button
            className={props.activeGenre === genre ? "active" : ""}
            key={genre}
            onClick={() => props.onGenreChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
      {props.hasActiveFilters && (
        <div className="active-filter-line">
          <span>Active filters</span>
          <button onClick={props.onReset}>
            Clear all <X size={14} />
          </button>
        </div>
      )}
      {props.isLoading ? (
        <LoadingGrid />
      ) : props.isError ? (
        <div className="empty-state">
          <h2>TMDB didn’t respond</h2>
          <p>Check your connection and try again.</p>
          <button className="primary-btn" onClick={props.onRetry}>
            Try again
          </button>
        </div>
      ) : props.titles.length ? (
        <>
          <div className="movie-grid">
            {props.titles.map((movie) => (
              <MovieCard movie={movie} key={`${movie.type}-${movie.id}`} />
            ))}
          </div>
          {props.hasNextPage && (
            <button
              className="load-more"
              disabled={props.isFetchingNextPage}
              onClick={props.onLoadMore}
            >
              {props.isFetchingNextPage ? "Loading…" : "Load more titles"}
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">
          <span>◎</span>
          <h2>No titles match that mix</h2>
          <p>Try lowering the rating or choosing another genre.</p>
          <button className="primary-btn" onClick={props.onReset}>
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
