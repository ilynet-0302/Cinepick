import { genreIds } from "../../data/genres";
import { requestTmdb } from "../../api/tmdb/client";
import { mapTmdbResults } from "../../api/tmdb/mappers";
import { tmdbResultsSchema } from "../../api/tmdb/schemas";
import { rankRecommendations, type PickCriteria } from "./recommendationEngine";
import type { Movie } from "../../types";

export async function getMoviePicks(criteria: PickCriteria): Promise<Movie[]> {
  const preferredId =
    criteria.preferredGenre !== "All"
      ? genreIds[criteria.preferredGenre]
      : undefined;
  const moodIds = criteria.moodGenres
    .map((genre) => genreIds[genre])
    .filter(Boolean);
  const companyIds = criteria.companyGenres
    .map((genre) => genreIds[genre])
    .filter(Boolean);
  const genreExpression =
    [preferredId, moodIds.length ? moodIds.join("|") : undefined]
      .filter(Boolean)
      .join(",") || companyIds.join("|");
  const query = new URLSearchParams({
    include_adult: "false",
    include_video: "false",
    sort_by: "popularity.desc",
    "vote_average.gte": String(criteria.minRating),
    "vote_count.gte": "150",
    page: String((criteria.seed % 5) + 1),
  });
  if (genreExpression) query.set("with_genres", genreExpression);
  if (criteria.time === "short") query.set("with_runtime.lte", "109");
  if (criteria.time === "medium") {
    query.set("with_runtime.gte", "110");
    query.set("with_runtime.lte", "150");
  }
  if (criteria.time === "long") query.set("with_runtime.gte", "151");
  if (criteria.minYear)
    query.set("primary_release_date.gte", `${criteria.minYear}-01-01`);

  const first = await requestTmdb(
    `/discover/movie?${query}`,
    tmdbResultsSchema,
  );
  let candidates = mapTmdbResults(first, "movie");
  if (candidates.length < 8) {
    if (moodIds.length) query.set("with_genres", moodIds.join("|"));
    else query.delete("with_genres");
    query.set("page", "1");
    candidates = [
      ...candidates,
      ...mapTmdbResults(
        await requestTmdb(`/discover/movie?${query}`, tmdbResultsSchema),
        "movie",
      ),
    ];
  }
  const unique = [
    ...new Map(candidates.map((movie) => [movie.id, movie])).values(),
  ];
  return rankRecommendations(unique, criteria);
}
