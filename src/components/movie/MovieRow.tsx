import { Link } from "react-router-dom";
import type { Movie } from "../../types";
import { MovieCard } from "./MovieCard";

interface MovieRowProps {
  title: string;
  kicker?: string;
  items: Movie[];
  numbered?: boolean;
}

export function MovieRow({
  title,
  kicker,
  items,
  numbered = false,
}: MovieRowProps) {
  return (
    <section className="content-section">
      <div className="section-head">
        <div>
          {kicker && <p className="eyebrow">{kicker}</p>}
          <h2>{title}</h2>
        </div>
        <Link to="/discover" className="text-link">
          Explore all <span>→</span>
        </Link>
      </div>
      <div className={`horizontal-grid ${numbered ? "numbered" : ""}`}>
        {items.map((movie, index) => (
          <MovieCard
            key={`${movie.type}:${movie.id}`}
            movie={movie}
            rank={numbered ? index + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
