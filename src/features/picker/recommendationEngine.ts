import type { Movie } from '../../types';

export type WatchTime = 'short' | 'medium' | 'long' | '';

export interface PickCriteria {
  moodGenres: string[];
  companyGenres: string[];
  time: WatchTime;
  minRating: number;
  preferredGenre: string;
  minYear?: number;
  includeWatched: boolean;
  watchedIds: number[];
  excludedIds: number[];
  seed: number;
}

const timeMatches = (movie: Movie, time: WatchTime) => {
  if (!time || !movie.runtime) return true;
  if (time === 'short') return movie.runtime < 110;
  if (time === 'medium') return movie.runtime >= 110 && movie.runtime <= 150;
  return movie.runtime > 150;
};

const seededNoise = (id: number, seed: number) => {
  const value = Math.sin(id * 12.9898 + (seed + 1) * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export function scoreMovie(movie: Movie, criteria: PickCriteria) {
  let score = movie.rating * 1.8 + movie.popularity * 0.035;
  const moodMatches = movie.genres.filter((genre) => criteria.moodGenres.includes(genre)).length;
  const companyMatches = movie.genres.filter((genre) => criteria.companyGenres.includes(genre)).length;

  score += moodMatches ? 13 + (moodMatches - 1) * 4 : -4;
  if (criteria.companyGenres.length) score += companyMatches ? 7 + (companyMatches - 1) * 2 : -2;
  if (criteria.preferredGenre !== 'All') score += movie.genres.includes(criteria.preferredGenre) ? 18 : -14;
  if (criteria.time) score += timeMatches(movie, criteria.time) ? 10 : -9;
  if (movie.rating >= criteria.minRating) score += 4; else score -= 10 + (criteria.minRating - movie.rating) * 12;
  if (criteria.minYear) score += movie.year >= criteria.minYear ? 4 : -12;
  if (criteria.excludedIds.includes(movie.id)) score -= 45;

  return score + seededNoise(movie.id, criteria.seed) * 6;
}

export function rankRecommendations(candidates: Movie[], criteria: PickCriteria, limit = 3) {
  const available = candidates.filter((movie) => movie.type === 'movie' && (criteria.includeWatched || !criteria.watchedIds.includes(movie.id)));
  const ranked = available.map((movie) => ({ movie, score: scoreMovie(movie, criteria) }));
  const selected: Movie[] = [];

  while (selected.length < limit && ranked.length) {
    ranked.sort((a, b) => {
      const diversityPenaltyA = selected.reduce((penalty, pick) => penalty + a.movie.genres.filter((genre) => pick.genres.includes(genre)).length * 2.5, 0);
      const diversityPenaltyB = selected.reduce((penalty, pick) => penalty + b.movie.genres.filter((genre) => pick.genres.includes(genre)).length * 2.5, 0);
      return (b.score - diversityPenaltyB) - (a.score - diversityPenaltyA);
    });
    selected.push(ranked.shift()!.movie);
  }

  return selected;
}

export function getMatchReasons(movie: Movie, criteria: PickCriteria) {
  const reasons: string[] = [];
  const moodGenre = movie.genres.find((genre) => criteria.moodGenres.includes(genre));
  const companyGenre = movie.genres.find((genre) => criteria.companyGenres.includes(genre));
  if (moodGenre) reasons.push(`${moodGenre} fits your mood`);
  if (criteria.time && movie.runtime) reasons.push(`${movie.runtime} min`);
  if (criteria.preferredGenre !== 'All' && movie.genres.includes(criteria.preferredGenre)) reasons.push(criteria.preferredGenre);
  if (companyGenre && companyGenre !== moodGenre) reasons.push(`Great for ${companyGenre.toLowerCase()} fans`);
  reasons.push(`${movie.rating.toFixed(1)} rated`);
  return reasons.slice(0, 3);
}
