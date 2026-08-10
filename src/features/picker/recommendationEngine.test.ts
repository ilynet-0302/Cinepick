import { describe, expect, it } from 'vitest';
import type { Movie } from '../../types';
import { rankRecommendations, type PickCriteria } from './recommendationEngine';

const catalog: Movie[] = Array.from({ length: 12 }, (_, index) => {
  const group = Math.floor(index / 4);
  const genreSets = [['Comedy'], ['Sci-Fi', 'Mystery'], ['Drama', 'Adventure']];
  const runtimes = [95, 165, 130];
  return {
    id: index + 1000, title: `Fixture ${index + 1}`, type: 'movie', year: 2020 + (index % 5),
    rating: 7 + (index % 4) * .3, voteCount: 500, genres: genreSets[group], genreIds: [],
    language: 'en', runtime: runtimes[group], overview: '', poster: '', backdrop: '',
    director: '', cast: [], popularity: 50 + index,
  };
});

const criteria: PickCriteria = {
  moodGenres: ['Comedy'], companyGenres: [], time: '', minRating: 5,
  preferredGenre: 'All', includeWatched: true, watchedIds: [], excludedIds: [], seed: 0,
};

describe('recommendation engine', () => {
  it('changes recommendations when the requested mood changes', () => {
    const funny = rankRecommendations(catalog, criteria).map((movie) => movie.id);
    const cerebral = rankRecommendations(catalog, { ...criteria, moodGenres: ['Sci-Fi', 'Mystery'] }).map((movie) => movie.id);
    expect(cerebral).not.toEqual(funny);
  });

  it('respects runtime preferences when matching titles exist', () => {
    const long = rankRecommendations(catalog, { ...criteria, moodGenres: [], time: 'long' });
    expect(long.every((movie) => movie.runtime > 150)).toBe(true);
  });

  it('returns a fresh set when previous picks are excluded', () => {
    const first = rankRecommendations(catalog, criteria);
    const next = rankRecommendations(catalog, { ...criteria, excludedIds: first.map((movie) => movie.id), seed: 1 });
    expect(next.some((movie) => first.some((pick) => pick.id === movie.id))).toBe(false);
  });
});
