import { supabase } from './supabase';
import { parseMediaKey } from '../utils/mediaKey';

export interface MediaState {
  inWatchlist: boolean;
  isFavorite: boolean;
  isWatched: boolean;
  rating: number | null;
  progress: number;
}

interface UserMediaRow {
  media_type: 'movie' | 'tv';
  tmdb_id: number;
  in_watchlist: boolean;
  is_favorite: boolean;
  is_watched: boolean;
  rating: number | null;
  progress_percent: number;
}

export async function fetchCloudMedia(userId: string) {
  if (!supabase) return new Map<string, MediaState>();
  const { data, error } = await supabase.from('user_media')
    .select('media_type, tmdb_id, in_watchlist, is_favorite, is_watched, rating, progress_percent')
    .eq('user_id', userId);
  if (error) throw error;
  return new Map((data as UserMediaRow[]).map((row) => [`${row.media_type}:${row.tmdb_id}`, {
    inWatchlist: row.in_watchlist, isFavorite: row.is_favorite, isWatched: row.is_watched,
    rating: row.rating, progress: row.progress_percent,
  }]));
}

export async function persistCloudMedia(userId: string, key: string, state: MediaState) {
  if (!supabase) return;
  const media = parseMediaKey(key);
  if (!media) return;
  const isEmpty = !state.inWatchlist && !state.isFavorite && !state.isWatched && !state.rating && !state.progress;
  if (isEmpty) {
    const { error } = await supabase.from('user_media').delete().eq('user_id', userId).eq('media_type', media.type).eq('tmdb_id', media.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('user_media').upsert({
    user_id: userId, media_type: media.type, tmdb_id: media.id,
    in_watchlist: state.inWatchlist, is_favorite: state.isFavorite,
    is_watched: state.isWatched, rating: state.rating,
    progress_percent: state.progress,
    watched_at: state.isWatched ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,media_type,tmdb_id' });
  if (error) throw error;
}
