import type { MediaType, Movie, Person } from "../../types";
import { parseMediaKey } from "../../utils/mediaKey";
import { requestTmdb } from "./client";
import { mapTmdbMedia, mapTmdbResults, tmdbImageUrl } from "./mappers";
import { tmdbResultsSchema, tmdbTitleDetailsSchema } from "./schemas";

export interface HomeFeed {
  trending: Movie[];
  popular: Movie[];
  topRated: Movie[];
  nowPlaying: Movie[];
  upcoming: Movie[];
  popularTv: Movie[];
}

export async function getTrending(): Promise<Movie[]> {
  return mapTmdbResults(
    await requestTmdb("/trending/all/week", tmdbResultsSchema),
  );
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const [trending, popular, topRated, nowPlaying, upcoming, popularTv] =
    await Promise.all([
      requestTmdb("/trending/all/week", tmdbResultsSchema),
      requestTmdb("/movie/popular", tmdbResultsSchema),
      requestTmdb("/movie/top_rated", tmdbResultsSchema),
      requestTmdb("/movie/now_playing", tmdbResultsSchema),
      requestTmdb("/movie/upcoming", tmdbResultsSchema),
      requestTmdb("/tv/popular", tmdbResultsSchema),
    ]);
  return {
    trending: mapTmdbResults(trending),
    popular: mapTmdbResults(popular, "movie"),
    topRated: mapTmdbResults(topRated, "movie"),
    nowPlaying: mapTmdbResults(nowPlaying, "movie"),
    upcoming: mapTmdbResults(upcoming, "movie"),
    popularTv: mapTmdbResults(popularTv, "tv"),
  };
}

export async function getTitleDetails(
  id: number,
  type: MediaType,
): Promise<Movie | undefined> {
  const data = await requestTmdb(
    `/${type}/${id}?append_to_response=credits`,
    tmdbTitleDetailsSchema,
  );
  const cast: Person[] = data.credits.cast.slice(0, 8).map((person) => ({
    id: person.id,
    name: person.name,
    role: person.character || "",
    photo: tmdbImageUrl(person.profile_path, "w300"),
  }));
  const director = data.credits.crew.find(
    (person) => person.job === "Director" || person.job === "Series Director",
  );
  const movie = mapTmdbMedia(
    { ...data, genre_ids: data.genres.map((genre) => genre.id) },
    type,
  );

  return {
    ...movie,
    runtime: data.runtime || data.episode_run_time[0] || 0,
    genres: data.genres.map((genre) => genre.name),
    director: director?.name || "Unknown",
    cast,
    country: data.production_countries[0]?.name || "Unknown",
    studio: data.production_companies[0]?.name || "Unknown",
    budget: data.budget,
    revenue: data.revenue,
  };
}

export async function getTitlesByKeys(keys: string[]): Promise<Movie[]> {
  const requests = keys
    .map(parseMediaKey)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => getTitleDetails(item.id, item.type));
  const results = await Promise.allSettled(requests);
  return results
    .filter(
      (result): result is PromiseFulfilledResult<Movie | undefined> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value)
    .filter((movie): movie is Movie => Boolean(movie));
}

export async function getRelatedTitles(
  id: number,
  type: MediaType,
): Promise<Movie[]> {
  const data = await requestTmdb(
    `/${type}/${id}/recommendations`,
    tmdbResultsSchema,
  );
  return mapTmdbResults(data, type).slice(0, 12);
}
