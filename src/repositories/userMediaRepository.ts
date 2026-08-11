import { z } from "zod";
import type { MediaState } from "../features/library/libraryTypes";
import { supabase } from "../services/supabase";
import { parseMediaKey } from "../utils/mediaKey";

const userMediaRowSchema = z.object({
  media_type: z.enum(["movie", "tv"]),
  tmdb_id: z.number().int().positive(),
  in_watchlist: z.boolean(),
  is_favorite: z.boolean(),
  is_watched: z.boolean(),
  rating: z.number().int().min(1).max(10).nullable(),
  progress_percent: z.number().int().min(0).max(100),
});

const userMediaRowsSchema = z.array(userMediaRowSchema);

export async function findUserMedia(
  userId: string,
): Promise<Map<string, MediaState>> {
  if (!supabase) return new Map();
  const { data, error } = await supabase
    .from("user_media")
    .select(
      "media_type, tmdb_id, in_watchlist, is_favorite, is_watched, rating, progress_percent",
    )
    .eq("user_id", userId);
  if (error) throw error;
  const result = userMediaRowsSchema.safeParse(data);
  if (!result.success)
    throw new Error("Library data has an unexpected format.");
  return new Map(
    result.data.map((row) => [
      `${row.media_type}:${row.tmdb_id}`,
      {
        inWatchlist: row.in_watchlist,
        isFavorite: row.is_favorite,
        isWatched: row.is_watched,
        rating: row.rating,
        progress: row.progress_percent,
      },
    ]),
  );
}

export async function saveUserMedia(
  userId: string,
  key: string,
  state: MediaState,
) {
  if (!supabase) return;
  const media = parseMediaKey(key);
  if (!media) throw new Error("Invalid media key.");
  const isEmpty =
    !state.inWatchlist &&
    !state.isFavorite &&
    !state.isWatched &&
    state.rating === null &&
    state.progress === 0;
  if (isEmpty) {
    const { error } = await supabase
      .from("user_media")
      .delete()
      .eq("user_id", userId)
      .eq("media_type", media.type)
      .eq("tmdb_id", media.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("user_media").upsert(
    {
      user_id: userId,
      media_type: media.type,
      tmdb_id: media.id,
      in_watchlist: state.inWatchlist,
      is_favorite: state.isFavorite,
      is_watched: state.isWatched,
      rating: state.rating,
      progress_percent: state.progress,
      watched_at: state.isWatched ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,media_type,tmdb_id" },
  );
  if (error) throw error;
}
