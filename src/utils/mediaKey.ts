import type { MediaType, Movie } from '../types';

export const mediaKey = (movie: Pick<Movie, 'id' | 'type'>) => `${movie.type}:${movie.id}`;

export function parseMediaKey(key: string): { type: MediaType; id: number } | null {
  const [type, rawId] = key.split(':');
  const id = Number(rawId);
  return (type === 'movie' || type === 'tv') && Number.isFinite(id) ? { type, id } : null;
}
