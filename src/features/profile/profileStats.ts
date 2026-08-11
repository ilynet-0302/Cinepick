import type { Movie } from "../../types";

export interface ProfileStats {
  watchedCount: number;
  totalMinutes: number;
  averageRating: number;
  favoriteGenre: string;
  genreStats: Array<[string, number]>;
  genreMax: number;
  genreTotal: number;
  twentyTwentiesPercent: number;
  directors: Array<[string, number]>;
  collection: Array<{ label: string; value: number }>;
  collectionMax: number;
}

export function buildProfileStats(
  watched: Movie[],
  ratings: Record<string, number>,
  collectionCounts: { watchlist: number; favorite: number; watched: number },
): ProfileStats {
  const totalMinutes = watched.reduce((sum, movie) => sum + movie.runtime, 0);
  const ratingValues = Object.values(ratings);
  const averageRating = ratingValues.length
    ? ratingValues.reduce((sum, rating) => sum + rating, 0) /
      ratingValues.length
    : 0;
  const genreCount = watched
    .flatMap((movie) => movie.genres)
    .reduce<Record<string, number>>((accumulator, genre) => {
      accumulator[genre] = (accumulator[genre] || 0) + 1;
      return accumulator;
    }, {});
  const genreStats = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const decades = watched.reduce<Record<string, number>>(
    (accumulator, movie) => {
      const decade = `${Math.floor(movie.year / 10) * 10}s`;
      accumulator[decade] = (accumulator[decade] || 0) + 1;
      return accumulator;
    },
    {},
  );
  const directors = Object.entries(
    watched.reduce<Record<string, number>>((accumulator, movie) => {
      if (movie.director !== "Unknown")
        accumulator[movie.director] = (accumulator[movie.director] || 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const collection = [
    { label: "Q", value: collectionCounts.watchlist },
    { label: "F", value: collectionCounts.favorite },
    { label: "W", value: collectionCounts.watched },
  ];

  return {
    watchedCount: watched.length,
    totalMinutes,
    averageRating,
    favoriteGenre: genreStats[0]?.[0] || "Still learning",
    genreStats,
    genreMax: Math.max(...genreStats.map(([, value]) => value), 1),
    genreTotal: Math.max(watched.flatMap((movie) => movie.genres).length, 1),
    twentyTwentiesPercent: Math.round(
      ((decades["2020s"] || 0) / Math.max(watched.length, 1)) * 100,
    ),
    directors,
    collection,
    collectionMax: Math.max(...collection.map((item) => item.value), 1),
  };
}
