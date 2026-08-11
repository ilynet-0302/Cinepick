import type { LibraryState, MediaState } from "./libraryTypes";

export function createInitialLibraryState(): LibraryState {
  return {
    watchlist: [],
    favorite: [],
    watched: [],
    ratings: {},
    progress: {},
  };
}

export function stateForKey(state: LibraryState, key: string): MediaState {
  return {
    inWatchlist: state.watchlist.includes(key),
    isFavorite: state.favorite.includes(key),
    isWatched: state.watched.includes(key),
    rating: state.ratings[key] ?? null,
    progress: state.progress[key] ?? 0,
  };
}

export function libraryFromMediaStates(
  rows: Map<string, MediaState>,
): LibraryState {
  const next = createInitialLibraryState();
  rows.forEach((value, key) => {
    if (value.inWatchlist) next.watchlist.push(key);
    if (value.isFavorite) next.favorite.push(key);
    if (value.isWatched) next.watched.push(key);
    if (value.rating !== null) next.ratings[key] = value.rating;
    if (value.progress > 0) next.progress[key] = value.progress;
  });
  return next;
}

export function mergeLibraries(
  local: LibraryState,
  cloud: LibraryState,
): LibraryState {
  const keys = new Set([
    ...local.watchlist,
    ...local.favorite,
    ...local.watched,
    ...Object.keys(local.ratings),
    ...Object.keys(local.progress),
    ...cloud.watchlist,
    ...cloud.favorite,
    ...cloud.watched,
    ...Object.keys(cloud.ratings),
    ...Object.keys(cloud.progress),
  ]);
  const merged = createInitialLibraryState();
  keys.forEach((key) => {
    if (local.watchlist.includes(key) || cloud.watchlist.includes(key))
      merged.watchlist.push(key);
    if (local.favorite.includes(key) || cloud.favorite.includes(key))
      merged.favorite.push(key);
    if (local.watched.includes(key) || cloud.watched.includes(key))
      merged.watched.push(key);
    const rating = cloud.ratings[key] ?? local.ratings[key];
    const progress = Math.max(
      local.progress[key] ?? 0,
      cloud.progress[key] ?? 0,
    );
    if (rating !== undefined) merged.ratings[key] = rating;
    if (progress > 0) merged.progress[key] = progress;
  });
  return merged;
}
