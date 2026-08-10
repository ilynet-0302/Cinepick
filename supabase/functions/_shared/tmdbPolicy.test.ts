import { describe, expect, it } from 'vitest';
import { validateTmdbPath } from './tmdbPolicy';

describe('TMDB proxy path policy', () => {
  it('allows the routes and parameters used by the application', () => {
    expect(validateTmdbPath('/trending/all/week')).toBe('/trending/all/week');
    expect(validateTmdbPath('/movie/42?append_to_response=credits')).toBe('/movie/42?append_to_response=credits');
    expect(validateTmdbPath('/discover/movie?include_adult=false&page=2&with_genres=28%7C12')).toBe('/discover/movie?include_adult=false&page=2&with_genres=28%7C12');
    expect(validateTmdbPath('/search/multi?query=star%20wars&include_adult=false')).toBe('/search/multi?query=star%20wars&include_adult=false');
  });

  it('rejects arbitrary hosts, routes, credentials, and invalid parameters', () => {
    expect(() => validateTmdbPath('//example.com/steal')).toThrow();
    expect(() => validateTmdbPath('/authentication/token/new')).toThrow();
    expect(() => validateTmdbPath('/movie/popular?api_key=stolen')).toThrow();
    expect(() => validateTmdbPath('/discover/movie?page=9999')).toThrow();
    expect(() => validateTmdbPath('/person/10?append_to_response=credits')).toThrow();
  });
});
