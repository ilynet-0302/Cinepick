import { genreNames } from "../../data/genres";
import type { MediaType, Movie, Person } from "../../types";
import type { TmdbMedia, TmdbResults } from "./schemas";

export function tmdbImageUrl(path: string | null | undefined, size = "w780") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}

export function mapTmdbMedia(item: TmdbMedia, forcedType?: MediaType): Movie {
  return {
    id: item.id,
    title: item.title || item.name || "Untitled",
    originalTitle: item.original_title || item.original_name || undefined,
    type: forcedType || (item.media_type === "tv" ? "tv" : "movie"),
    year: Number((item.release_date || item.first_air_date || "0").slice(0, 4)),
    rating: item.vote_average,
    voteCount: item.vote_count,
    genres: item.genre_ids.map((id) => genreNames[id]).filter(Boolean),
    genreIds: item.genre_ids,
    language: item.original_language,
    runtime: 0,
    overview: item.overview || "No overview is available for this title yet.",
    poster: tmdbImageUrl(item.poster_path),
    backdrop: tmdbImageUrl(item.backdrop_path, "original"),
    director: "Unknown",
    cast: [],
    popularity: item.popularity,
  };
}

export function mapTmdbResults(
  data: TmdbResults,
  forcedType?: MediaType,
): Movie[] {
  return data.results
    .filter((item) => item.poster_path)
    .map((item) => mapTmdbMedia(item, forcedType));
}

export function mapTmdbPerson(person: {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
}): Person {
  return {
    id: person.id,
    name: person.name,
    role: person.known_for_department,
    photo: tmdbImageUrl(person.profile_path, "w300"),
  };
}
