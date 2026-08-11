export const genreNames: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  53: "Thriller",
  80: "Crime",
  878: "Sci-Fi",
  9648: "Mystery",
  10749: "Romance",
  10751: "Family",
  10752: "War",
};

export const genreIds: Record<string, number> = Object.fromEntries(
  Object.entries(genreNames).map(([id, name]) => [name, Number(id)]),
);

export const genres = ["All", ...Object.values(genreNames).sort()];
