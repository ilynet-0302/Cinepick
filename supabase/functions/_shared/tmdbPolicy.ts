const API_ORIGIN = 'https://api.themoviedb.org';
const API_BASE_PATH = '/3';

const discoverParameters = new Set([
  'include_adult', 'include_video', 'page', 'sort_by', 'vote_count.gte',
  'with_genres', 'vote_average.gte', 'with_original_language',
  'primary_release_date.gte', 'primary_release_date.lte', 'primary_release_year',
  'first_air_date.gte', 'first_air_date.lte', 'first_air_date_year',
  'with_runtime.gte', 'with_runtime.lte',
]);

const routePolicies: Array<{ pattern: RegExp; parameters: Set<string> }> = [
  { pattern: /^\/trending\/all\/week$/, parameters: new Set() },
  { pattern: /^\/(?:movie\/(?:popular|top_rated|now_playing|upcoming)|tv\/popular)$/, parameters: new Set() },
  { pattern: /^\/discover\/(?:movie|tv)$/, parameters: discoverParameters },
  { pattern: /^\/search\/(?:multi|person)$/, parameters: new Set(['query', 'include_adult']) },
  { pattern: /^\/(?:movie|tv)\/\d+$/, parameters: new Set(['append_to_response']) },
  { pattern: /^\/(?:movie|tv)\/\d+\/recommendations$/, parameters: new Set() },
  { pattern: /^\/person\/\d+$/, parameters: new Set(['append_to_response']) },
];

function isValidParameter(name: string, value: string, pathname: string) {
  switch (name) {
    case 'include_adult':
    case 'include_video':
      return value === 'false';
    case 'page':
      return /^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 500;
    case 'sort_by':
      return ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc', 'first_air_date.desc'].includes(value);
    case 'vote_count.gte':
      return /^\d{1,8}$/.test(value);
    case 'vote_average.gte':
      return /^\d{1,2}(?:\.\d)?$/.test(value) && Number(value) >= 0 && Number(value) <= 10;
    case 'with_genres':
      return /^\d+(?:[|,]\d+)*$/.test(value);
    case 'with_original_language':
      return /^[a-z]{2,3}$/.test(value);
    case 'primary_release_date.gte':
    case 'primary_release_date.lte':
    case 'first_air_date.gte':
    case 'first_air_date.lte':
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    case 'primary_release_year':
    case 'first_air_date_year':
      return /^\d{4}$/.test(value) && Number(value) >= 1888 && Number(value) <= 2100;
    case 'with_runtime.gte':
    case 'with_runtime.lte':
      return /^\d{1,4}$/.test(value) && Number(value) <= 1000;
    case 'query':
      return value.trim().length > 0 && value.length <= 120 && !/[\u0000-\u001f]/.test(value);
    case 'append_to_response':
      return pathname.startsWith('/person/') ? value === 'combined_credits' : value === 'credits';
    default:
      return false;
  }
}

export function validateTmdbPath(input: unknown) {
  if (typeof input !== 'string' || !input.startsWith('/') || input.startsWith('//') || input.length > 800) {
    throw new Error('Invalid TMDB request path.');
  }

  const url = new URL(`${API_ORIGIN}${API_BASE_PATH}${input}`);
  if (url.origin !== API_ORIGIN || !url.pathname.startsWith(`${API_BASE_PATH}/`) || url.hash) {
    throw new Error('Invalid TMDB request URL.');
  }

  const pathname = url.pathname.slice(API_BASE_PATH.length);
  const policy = routePolicies.find(({ pattern }) => pattern.test(pathname));
  if (!policy) throw new Error('TMDB route is not allowed.');

  const seen = new Set<string>();
  for (const [name, value] of url.searchParams) {
    if (seen.has(name) || !policy.parameters.has(name) || !isValidParameter(name, value, pathname)) {
      throw new Error('TMDB query parameter is not allowed.');
    }
    seen.add(name);
  }

  return `${pathname}${url.search}`;
}
