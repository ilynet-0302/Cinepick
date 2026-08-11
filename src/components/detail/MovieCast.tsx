import { Link } from "react-router-dom";
import type { Movie } from "../../types";

export function MovieCast({ movie }: { movie: Movie }) {
  return (
    <section className="cast-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Faces of the story</p>
          <h2>Top cast</h2>
        </div>
      </div>
      {movie.cast.length ? (
        <div className="cast-row">
          {movie.cast.map((person) => (
            <Link
              to={`/person/${person.id}`}
              key={person.id}
              className="cast-card"
            >
              <img src={person.photo} alt={person.name} />
              <span>
                <b>{person.name}</b>
                <small>{person.role}</small>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="muted">
          Full cast information is available when connected to TMDB.
        </p>
      )}
    </section>
  );
}
