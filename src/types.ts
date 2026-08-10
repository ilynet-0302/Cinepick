export type MediaType = 'movie' | 'tv';
export type ListType = 'watchlist' | 'favorite' | 'watched';

export interface Person {
  id: number;
  name: string;
  role: string;
  photo: string;
  biography?: string;
  birthday?: string;
}

export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  type: MediaType;
  year: number;
  rating: number;
  voteCount: number;
  genres: string[];
  genreIds: number[];
  language: string;
  runtime: number;
  overview: string;
  poster: string;
  backdrop: string;
  director: string;
  cast: Person[];
  popularity: number;
  budget?: number;
  revenue?: number;
  country?: string;
  studio?: string;
}
