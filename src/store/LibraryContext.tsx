import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ListType, Movie } from '../types';
import { mediaKey } from '../utils/mediaKey';
import { fetchCloudMedia, persistCloudMedia, type MediaState } from '../services/userData';
import { useAuth } from './AuthContext';

interface LibraryState {
  watchlist: string[];
  favorite: string[];
  watched: string[];
  ratings: Record<string, number>;
  progress: Record<string, number>;
}

interface LibraryContextValue extends LibraryState {
  cloudLoading: boolean;
  syncError: string | null;
  toggle: (list: ListType, movie: Movie) => void;
  inList: (list: ListType, movie: Movie) => boolean;
  rate: (movie: Movie, rating: number) => void;
  setProgress: (movie: Movie, progress: number) => void;
}

const STORAGE_KEY = 'cinepick-library-v2';
const initial: LibraryState = { watchlist: [], favorite: [], watched: [], ratings: {}, progress: {} };
const LibraryContext = createContext<LibraryContextValue | null>(null);

function readLibrary(): LibraryState {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? { ...initial, ...JSON.parse(value) } : initial;
  } catch { return initial; }
}

const stateForKey = (state: LibraryState, key: string): MediaState => ({
  inWatchlist: state.watchlist.includes(key), isFavorite: state.favorite.includes(key),
  isWatched: state.watched.includes(key), rating: state.ratings[key] || null,
  progress: state.progress[key] || 0,
});

function fromCloud(rows: Map<string, MediaState>): LibraryState {
  const next: LibraryState = { ...initial, watchlist: [], favorite: [], watched: [], ratings: {}, progress: {} };
  rows.forEach((value, key) => {
    if (value.inWatchlist) next.watchlist.push(key);
    if (value.isFavorite) next.favorite.push(key);
    if (value.isWatched) next.watched.push(key);
    if (value.rating) next.ratings[key] = value.rating;
    if (value.progress) next.progress[key] = value.progress;
  });
  return next;
}

function mergeLibraries(local: LibraryState, cloud: LibraryState): LibraryState {
  const keys = new Set([...local.watchlist, ...local.favorite, ...local.watched, ...Object.keys(local.ratings), ...Object.keys(local.progress), ...cloud.watchlist, ...cloud.favorite, ...cloud.watched, ...Object.keys(cloud.ratings), ...Object.keys(cloud.progress)]);
  const merged: LibraryState = { ...initial, watchlist: [], favorite: [], watched: [], ratings: {}, progress: {} };
  keys.forEach((key) => {
    if (local.watchlist.includes(key) || cloud.watchlist.includes(key)) merged.watchlist.push(key);
    if (local.favorite.includes(key) || cloud.favorite.includes(key)) merged.favorite.push(key);
    if (local.watched.includes(key) || cloud.watched.includes(key)) merged.watched.push(key);
    const rating = cloud.ratings[key] || local.ratings[key];
    const progress = Math.max(local.progress[key] || 0, cloud.progress[key] || 0);
    if (rating) merged.ratings[key] = rating;
    if (progress) merged.progress[key] = progress;
  });
  return merged;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<LibraryState>(readLibrary);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setState(readLibrary()); setCloudLoading(false); return; }
    let active = true;
    setCloudLoading(true); setSyncError(null);
    const guest = readLibrary();
    fetchCloudMedia(user.id).then(async (rows) => {
      if (!active) return;
      const merged = mergeLibraries(guest, fromCloud(rows));
      setState(merged);
      const keys = new Set([...merged.watchlist, ...merged.favorite, ...merged.watched, ...Object.keys(merged.ratings), ...Object.keys(merged.progress)]);
      await Promise.all([...keys].map((key) => persistCloudMedia(user.id, key, stateForKey(merged, key))));
      localStorage.removeItem(STORAGE_KEY);
    }).catch((error: Error) => active && setSyncError(error.message)).finally(() => active && setCloudLoading(false));
    return () => { active = false; };
  }, [user?.id, authLoading]);

  useEffect(() => {
    if (!user && !authLoading) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, user, authLoading]);

  const persist = (key: string, next: LibraryState) => {
    if (!user) return;
    setSyncError(null);
    void persistCloudMedia(user.id, key, stateForKey(next, key)).catch((error: Error) => setSyncError(error.message));
  };

  const value = useMemo<LibraryContextValue>(() => ({
    ...state, cloudLoading, syncError,
    toggle: (list, movie) => {
      const key = mediaKey(movie);
      setState((current) => {
        const next = { ...current, [list]: current[list].includes(key) ? current[list].filter((item) => item !== key) : [...current[list], key] };
        persist(key, next); return next;
      });
    },
    inList: (list, movie) => state[list].includes(mediaKey(movie)),
    rate: (movie, rating) => {
      const key = mediaKey(movie);
      setState((current) => { const next = { ...current, ratings: { ...current.ratings, [key]: rating } }; persist(key, next); return next; });
    },
    setProgress: (movie, progress) => {
      const key = mediaKey(movie);
      const value = Math.max(0, Math.min(100, Math.round(progress)));
      setState((current) => {
        const watched = value >= 100 && !current.watched.includes(key) ? [...current.watched, key] : current.watched;
        const next = { ...current, watched, progress: { ...current.progress, [key]: value } };
        persist(key, next); return next;
      });
    },
  }), [state, cloudLoading, syncError, user?.id]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error('useLibrary must be used inside LibraryProvider');
  return value;
}
