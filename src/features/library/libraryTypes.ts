import type { ListType, Movie } from "../../types";

export interface LibraryState {
  watchlist: string[];
  favorite: string[];
  watched: string[];
  ratings: Record<string, number>;
  progress: Record<string, number>;
}

export interface MediaState {
  inWatchlist: boolean;
  isFavorite: boolean;
  isWatched: boolean;
  rating: number | null;
  progress: number;
}

export interface LibraryContextValue extends LibraryState {
  cloudLoading: boolean;
  syncError: string | null;
  toggle: (list: ListType, movie: Movie) => void;
  inList: (list: ListType, movie: Movie) => boolean;
  rate: (movie: Movie, rating: number) => void;
  setProgress: (movie: Movie, progress: number) => void;
}
