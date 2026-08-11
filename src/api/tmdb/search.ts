import type { Movie, Person } from "../../types";
import { requestTmdb } from "./client";
import { mapTmdbMedia, mapTmdbPerson } from "./mappers";
import { tmdbPeopleResultsSchema, tmdbResultsSchema } from "./schemas";

export async function searchTitles(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const data = await requestTmdb(
    `/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
    tmdbResultsSchema,
  );
  return data.results
    .filter(
      (item) =>
        (item.media_type === "movie" || item.media_type === "tv") &&
        item.poster_path,
    )
    .map((item) => mapTmdbMedia(item));
}

export async function searchPeople(query: string): Promise<Person[]> {
  if (!query.trim()) return [];
  const data = await requestTmdb(
    `/search/person?query=${encodeURIComponent(query)}&include_adult=false`,
    tmdbPeopleResultsSchema,
  );
  return data.results.slice(0, 8).map(mapTmdbPerson);
}
