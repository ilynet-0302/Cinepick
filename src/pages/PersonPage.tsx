import { ArrowLeft, Cake, Clapperboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MovieCard } from "../components/movie/MovieCard";
import { getPersonDetails } from "../api/tmdb";
import { parsePositiveId } from "../validation/routeParams";

export default function PersonPage() {
  const { id: rawId } = useParams();
  const id = parsePositiveId(rawId);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["person", id],
    queryFn: () => getPersonDetails(id!),
    enabled: id !== null,
  });
  const person = data?.person;
  if (isLoading)
    return (
      <div className="standard-page empty-state">
        <span>◌</span>
        <h2>Loading profile…</h2>
      </div>
    );
  if (!person)
    return (
      <div className="standard-page empty-state">
        <h1>Person not found</h1>
        <Link to="/">Return home</Link>
      </div>
    );
  const credits = data?.credits || [];
  return (
    <div className="standard-page person-page page-enter">
      <button className="back-inline" onClick={() => navigate(-1)}>
        <ArrowLeft size={17} /> Back to movie
      </button>
      <section className="person-hero">
        <img src={person.photo} alt={person.name} />
        <div>
          <p className="eyebrow">Actor profile</p>
          <h1>{person.name}</h1>
          <div className="person-meta">
            <span>
              <Cake size={16} /> {person.birthday}
            </span>
            <span>
              <Clapperboard size={16} /> Known for {person.role}
            </span>
          </div>
          <p>{person.biography}</p>
        </div>
      </section>
      <section className="content-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2>Filmography</h2>
          </div>
          <select aria-label="Sort filmography">
            <option>Newest first</option>
            <option>Most popular</option>
          </select>
        </div>
        <div className="movie-grid">
          {credits.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
