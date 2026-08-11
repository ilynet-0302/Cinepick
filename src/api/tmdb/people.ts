import type { Movie, Person } from "../../types";
import { requestTmdb } from "./client";
import { mapTmdbMedia, mapTmdbPerson } from "./mappers";
import { tmdbPersonDetailsSchema } from "./schemas";

export async function getPersonDetails(
  id: number,
): Promise<{ person: Person; credits: Movie[] } | undefined> {
  const data = await requestTmdb(
    `/person/${id}?append_to_response=combined_credits`,
    tmdbPersonDetailsSchema,
  );
  const credits = data.combined_credits.cast
    .filter(
      (credit) =>
        (credit.media_type === "movie" || credit.media_type === "tv") &&
        credit.poster_path,
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 16)
    .map((credit) => mapTmdbMedia(credit));
  return {
    person: {
      ...mapTmdbPerson(data),
      biography: data.biography || "No biography is available yet.",
      birthday: data.birthday || "Unknown",
    },
    credits,
  };
}
