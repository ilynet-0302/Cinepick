import type { MediaType, Movie } from "../../types";
import { requestTmdb } from "./client";
import { mapTmdbResults } from "./mappers";
import { tmdbResultsSchema } from "./schemas";

export interface DiscoverFilters {
  genre?: string;
  type?: "all" | MediaType;
  rating?: number;
  year?: string;
  language?: string;
  sort?: string;
}

function buildDiscoverQuery(
  filters: DiscoverFilters,
  page: number,
  type: MediaType,
) {
  const sortMap: Record<string, string> = {
    popularity: "popularity.desc",
    rating: "vote_average.desc",
    release:
      type === "movie" ? "primary_release_date.desc" : "first_air_date.desc",
  };
  const query = new URLSearchParams({
    include_adult: "false",
    page: String(page),
    sort_by: sortMap[filters.sort || "popularity"] || sortMap.popularity,
    "vote_count.gte": filters.sort === "rating" ? "200" : "50",
  });
  if (filters.genre) query.set("with_genres", filters.genre);
  if (filters.rating) query.set("vote_average.gte", String(filters.rating));
  if (filters.language) query.set("with_original_language", filters.language);
  if (filters.year === "2020s")
    query.set(
      type === "movie" ? "primary_release_date.gte" : "first_air_date.gte",
      "2020-01-01",
    );
  else if (filters.year === "2010s") {
    query.set(
      type === "movie" ? "primary_release_date.gte" : "first_air_date.gte",
      "2010-01-01",
    );
    query.set(
      type === "movie" ? "primary_release_date.lte" : "first_air_date.lte",
      "2019-12-31",
    );
  } else if (filters.year) {
    query.set(
      type === "movie" ? "primary_release_year" : "first_air_date_year",
      filters.year,
    );
  }
  return query;
}

export async function discoverTitles(
  filters: DiscoverFilters,
  page = 1,
): Promise<{ results: Movie[]; totalPages: number }> {
  const types: MediaType[] =
    filters.type && filters.type !== "all" ? [filters.type] : ["movie", "tv"];
  const responses = await Promise.all(
    types.map(async (type) => ({
      type,
      data: await requestTmdb(
        `/discover/${type}?${buildDiscoverQuery(filters, page, type)}`,
        tmdbResultsSchema,
      ),
    })),
  );
  const results = responses
    .flatMap(({ type, data }) => mapTmdbResults(data, type))
    .sort((a, b) =>
      filters.sort === "rating"
        ? b.rating - a.rating
        : filters.sort === "release"
          ? b.year - a.year
          : b.popularity - a.popularity,
    );
  return {
    results,
    totalPages: Math.max(...responses.map(({ data }) => data.total_pages)),
  };
}
