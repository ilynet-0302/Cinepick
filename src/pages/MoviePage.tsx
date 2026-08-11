import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { MovieRow } from "../components/movie/MovieRow";
import { MovieCast } from "../components/detail/MovieCast";
import { MovieFacts } from "../components/detail/MovieFacts";
import { MovieHero } from "../components/detail/MovieHero";
import { MovieRatingPanel } from "../components/detail/MovieRatingPanel";
import { getRelatedTitles, getTitleDetails } from "../api/tmdb";
import type { MediaType } from "../types";
import { parsePositiveId } from "../validation/routeParams";

export default function MoviePage() {
  const { id: rawId } = useParams();
  const id = parsePositiveId(rawId);
  const location = useLocation();
  const type: MediaType = location.pathname.startsWith("/tv/") ? "tv" : "movie";
  const { data: movie, isLoading } = useQuery({
    queryKey: ["title", type, id],
    queryFn: () => getTitleDetails(id!, type),
    enabled: id !== null,
  });
  const { data: similar = [] } = useQuery({
    queryKey: ["related", type, id],
    queryFn: () => getRelatedTitles(id!, type),
    enabled: id !== null,
  });
  const navigate = useNavigate();
  if (isLoading)
    return (
      <div className="standard-page empty-state">
        <span>◌</span>
        <h2>Setting the scene…</h2>
        <p>Loading title details from TMDB.</p>
      </div>
    );
  if (!movie)
    return (
      <div className="standard-page empty-state">
        <span>404</span>
        <h1>That title left the theater</h1>
        <p>We couldn’t find this movie in the catalog.</p>
        <Link className="primary-btn" to="/discover">
          Browse movies
        </Link>
      </div>
    );

  return (
    <div className="detail-page page-enter">
      <MovieHero movie={movie} onBack={() => navigate(-1)} />
      <div className="detail-body">
        <section className="detail-main">
          <MovieRatingPanel movie={movie} />
          <MovieCast movie={movie} />
        </section>
        <MovieFacts movie={movie} />
      </div>
      {similar.length > 0 && (
        <div className="detail-similar">
          <MovieRow
            title="You may also like"
            kicker="More stories like this"
            items={similar}
          />
        </div>
      )}
    </div>
  );
}
