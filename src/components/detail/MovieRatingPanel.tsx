import { Star } from "lucide-react";
import { useLibrary } from "../../features/library/useLibrary";
import type { Movie } from "../../types";
import { mediaKey } from "../../utils/mediaKey";

export function MovieRatingPanel({ movie }: { movie: Movie }) {
  const library = useLibrary();
  return (
    <div className="rating-box">
      <div>
        <span>Audience score</span>
        <strong>{Math.round(movie.rating * 10)}%</strong>
        <small>{movie.voteCount.toLocaleString()} ratings</small>
      </div>
      <div className="rating-stars">
        <p>Your rating</p>
        {[2, 4, 6, 8, 10].map((rating) => (
          <button
            aria-label={`Rate ${rating} out of 10`}
            onClick={() => library.rate(movie, rating)}
            className={
              (library.ratings[mediaKey(movie)] || 0) >= rating ? "filled" : ""
            }
            key={rating}
          >
            <Star size={22} fill="currentColor" />
          </button>
        ))}
      </div>
    </div>
  );
}
