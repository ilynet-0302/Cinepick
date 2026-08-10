import { genreIds, genreNames } from '../data/genres';
import { rankRecommendations, type PickCriteria } from '../features/picker/recommendationEngine';
import type { MediaType, Movie, Person } from '../types';
import { parseMediaKey } from '../utils/mediaKey';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const API_URL = 'https://api.themoviedb.org/3';
const image = (path: string | null | undefined, size = 'w780') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '';

type TmdbMovie = {
  id: number; title?: string; name?: string; original_title?: string; original_name?: string;
  media_type?: MediaType; release_date?: string; first_air_date?: string; vote_average: number;
  vote_count: number; genre_ids?: number[]; original_language: string; overview: string;
  poster_path: string | null; backdrop_path: string | null; popularity: number;
};

export interface DiscoverFilters {
  genre?: string;
  type?: 'all' | MediaType;
  rating?: number;
  year?: string;
  language?: string;
  sort?: string;
}

export interface HomeFeed {
  trending: Movie[]; popular: Movie[]; topRated: Movie[];
  nowPlaying: Movie[]; upcoming: Movie[]; popularTv: Movie[];
}

const normalize = (item: TmdbMovie, forcedType?: MediaType): Movie => ({
  id: item.id,
  title: item.title || item.name || 'Untitled',
  originalTitle: item.original_title || item.original_name,
  type: forcedType || item.media_type || (item.name ? 'tv' : 'movie'),
  year: Number((item.release_date || item.first_air_date || '0').slice(0, 4)),
  rating: item.vote_average || 0,
  voteCount: item.vote_count || 0,
  genres: (item.genre_ids || []).map((id) => genreNames[id]).filter(Boolean),
  genreIds: item.genre_ids || [],
  language: item.original_language || 'en',
  runtime: 0,
  overview: item.overview || 'No overview is available for this title yet.',
  poster: image(item.poster_path),
  backdrop: image(item.backdrop_path, 'original'),
  director: 'Unknown', cast: [], popularity: item.popularity || 0,
});

async function request(path: string) {
  if (!API_KEY) throw new Error('Add VITE_TMDB_API_KEY to .env and restart the development server.');
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${API_URL}${path}${separator}api_key=${API_KEY}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('TMDB title not found.');
    if (response.status === 429) throw new Error('TMDB rate limit reached. Please try again shortly.');
    throw new Error('Could not reach TMDB.');
  }
  return response.json();
}

const normalizeResults = (data: { results?: TmdbMovie[] }, forcedType?: MediaType) =>
  (data.results || []).filter((item) => item.poster_path).map((item) => normalize(item, forcedType));

export async function getTrending(): Promise<Movie[]> {
  return normalizeResults(await request('/trending/all/week'));
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const [trending, popular, topRated, nowPlaying, upcoming, popularTv] = await Promise.all([
    request('/trending/all/week'), request('/movie/popular'), request('/movie/top_rated'),
    request('/movie/now_playing'), request('/movie/upcoming'), request('/tv/popular'),
  ]);
  return {
    trending: normalizeResults(trending), popular: normalizeResults(popular, 'movie'),
    topRated: normalizeResults(topRated, 'movie'), nowPlaying: normalizeResults(nowPlaying, 'movie'),
    upcoming: normalizeResults(upcoming, 'movie'), popularTv: normalizeResults(popularTv, 'tv'),
  };
}

function discoverQuery(filters: DiscoverFilters, page: number, type: MediaType) {
  const sortMap: Record<string, string> = { popularity: 'popularity.desc', rating: 'vote_average.desc', release: type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc' };
  const query = new URLSearchParams({
    include_adult: 'false', page: String(page), sort_by: sortMap[filters.sort || 'popularity'],
    'vote_count.gte': filters.sort === 'rating' ? '200' : '50',
  });
  if (filters.genre) query.set('with_genres', filters.genre);
  if (filters.rating) query.set('vote_average.gte', String(filters.rating));
  if (filters.language) query.set('with_original_language', filters.language);
  if (filters.year === '2020s') query.set(type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte', '2020-01-01');
  else if (filters.year === '2010s') {
    query.set(type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte', '2010-01-01');
    query.set(type === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte', '2019-12-31');
  } else if (filters.year) query.set(type === 'movie' ? 'primary_release_year' : 'first_air_date_year', filters.year);
  return query;
}

export async function discoverTitles(filters: DiscoverFilters, page = 1): Promise<{ results: Movie[]; totalPages: number }> {
  const types: MediaType[] = filters.type && filters.type !== 'all' ? [filters.type] : ['movie', 'tv'];
  const responses = await Promise.all(types.map(async (type) => ({ type, data: await request(`/discover/${type}?${discoverQuery(filters, page, type)}`) })));
  const results = responses.flatMap(({ type, data }) => normalizeResults(data, type))
    .sort((a, b) => filters.sort === 'rating' ? b.rating - a.rating : filters.sort === 'release' ? b.year - a.year : b.popularity - a.popularity);
  return { results, totalPages: Math.max(...responses.map(({ data }) => Number(data.total_pages || 1))) };
}

export async function searchTitles(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const data = await request(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);
  return (data.results || []).filter((item: TmdbMovie) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path).map((item: TmdbMovie) => normalize(item));
}

export async function searchPeople(query: string): Promise<Person[]> {
  if (!query.trim()) return [];
  const data = await request(`/search/person?query=${encodeURIComponent(query)}&include_adult=false`);
  return data.results.slice(0, 8).map((person: Record<string, unknown>) => ({
    id: Number(person.id), name: String(person.name || 'Unknown'), role: String(person.known_for_department || 'Known for'), photo: image(person.profile_path as string | null, 'w300'),
  }));
}

export async function getTitleDetails(id: number, type: MediaType): Promise<Movie | undefined> {
  const data = await request(`/${type}/${id}?append_to_response=credits`) as Record<string, unknown>;
  const credits = data.credits as { cast?: Array<Record<string, unknown>>; crew?: Array<Record<string, unknown>> } | undefined;
  const cast: Person[] = (credits?.cast || []).slice(0, 8).map((person) => ({
    id: Number(person.id), name: String(person.name || 'Unknown'), role: String(person.character || ''), photo: image(person.profile_path as string | null, 'w300'),
  }));
  const director = credits?.crew?.find((person) => person.job === 'Director' || person.job === 'Series Director');
  const movie = normalize({
    id: Number(data.id), title: data.title as string, name: data.name as string,
    original_title: data.original_title as string, original_name: data.original_name as string,
    media_type: type, release_date: data.release_date as string, first_air_date: data.first_air_date as string,
    vote_average: Number(data.vote_average || 0), vote_count: Number(data.vote_count || 0),
    genre_ids: ((data.genres as Array<{ id: number }> | undefined) || []).map((genre) => genre.id),
    original_language: String(data.original_language || 'en'), overview: String(data.overview || ''),
    poster_path: data.poster_path as string | null, backdrop_path: data.backdrop_path as string | null,
    popularity: Number(data.popularity || 0),
  }, type);
  return {
    ...movie, runtime: Number(data.runtime || ((data.episode_run_time as number[] | undefined)?.[0]) || 0),
    genres: ((data.genres as Array<{ name: string }> | undefined) || []).map((genre) => genre.name),
    director: String(director?.name || 'Unknown'), cast,
    country: ((data.production_countries as Array<{ name: string }> | undefined) || [])[0]?.name || 'Unknown',
    studio: ((data.production_companies as Array<{ name: string }> | undefined) || [])[0]?.name || 'Unknown',
    budget: Number(data.budget || 0), revenue: Number(data.revenue || 0),
  };
}

export async function getTitlesByKeys(keys: string[]): Promise<Movie[]> {
  const requests = keys.map((key) => parseMediaKey(key)).filter(Boolean).map((item) => getTitleDetails(item!.id, item!.type));
  const results = await Promise.allSettled(requests);
  return results.filter((result): result is PromiseFulfilledResult<Movie | undefined> => result.status === 'fulfilled').map((result) => result.value).filter(Boolean) as Movie[];
}

export async function getRelatedTitles(id: number, type: MediaType): Promise<Movie[]> {
  const data = await request(`/${type}/${id}/recommendations`);
  return normalizeResults(data, type).slice(0, 12);
}

export async function getPersonDetails(id: number): Promise<{ person: Person; credits: Movie[] } | undefined> {
  const data = await request(`/person/${id}?append_to_response=combined_credits`) as Record<string, unknown>;
  const rawCredits = ((data.combined_credits as { cast?: TmdbMovie[] } | undefined)?.cast || [])
    .filter((credit) => (credit.media_type === 'movie' || credit.media_type === 'tv') && credit.poster_path)
    .sort((a, b) => b.popularity - a.popularity).slice(0, 16);
  return {
    person: { id: Number(data.id), name: String(data.name || 'Unknown'), role: String(data.known_for_department || 'Known for'), photo: image(data.profile_path as string | null, 'w300'), biography: String(data.biography || 'No biography is available yet.'), birthday: String(data.birthday || 'Unknown') },
    credits: rawCredits.map((credit) => normalize(credit)),
  };
}

export async function getMoviePicks(criteria: PickCriteria): Promise<Movie[]> {
  const preferredId = criteria.preferredGenre !== 'All' ? genreIds[criteria.preferredGenre] : undefined;
  const moodIds = criteria.moodGenres.map((genre) => genreIds[genre]).filter(Boolean);
  const companyIds = criteria.companyGenres.map((genre) => genreIds[genre]).filter(Boolean);
  const genreExpression = [preferredId, moodIds.length ? moodIds.join('|') : undefined].filter(Boolean).join(',') || companyIds.join('|');
  const query = new URLSearchParams({ include_adult: 'false', include_video: 'false', sort_by: 'popularity.desc', 'vote_average.gte': String(criteria.minRating), 'vote_count.gte': '150', page: String((criteria.seed % 5) + 1) });
  if (genreExpression) query.set('with_genres', genreExpression);
  if (criteria.time === 'short') query.set('with_runtime.lte', '109');
  if (criteria.time === 'medium') { query.set('with_runtime.gte', '110'); query.set('with_runtime.lte', '150'); }
  if (criteria.time === 'long') query.set('with_runtime.gte', '151');
  if (criteria.minYear) query.set('primary_release_date.gte', `${criteria.minYear}-01-01`);

  const first = await request(`/discover/movie?${query}`);
  let candidates = normalizeResults(first, 'movie');
  if (candidates.length < 8) {
    if (moodIds.length) query.set('with_genres', moodIds.join('|')); else query.delete('with_genres');
    query.set('page', '1');
    candidates = [...candidates, ...normalizeResults(await request(`/discover/movie?${query}`), 'movie')];
  }
  const unique = [...new Map(candidates.map((movie) => [movie.id, movie])).values()];
  return rankRecommendations(unique, criteria);
}

export const tmdbEnabled = Boolean(API_KEY);
