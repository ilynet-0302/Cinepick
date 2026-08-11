import { z } from "zod";
import { genreIds } from "../../data/genres";

const validGenreIds = new Set(Object.values(genreIds).map(String));
const genreSchema = z
  .string()
  .refine((value) => !value || validGenreIds.has(value))
  .catch("");
const ratingSchema = z.coerce.number().min(0).max(9).multipleOf(0.5).catch(0);
const yearSchema = z
  .union([
    z.literal("all"),
    z.literal("2020s"),
    z.literal("2010s"),
    z
      .string()
      .regex(/^\d{4}$/)
      .refine((value) => Number(value) >= 1888 && Number(value) <= 2100),
  ])
  .catch("all");

export function parseDiscoverSearchParams(params: URLSearchParams) {
  return {
    genre: genreSchema.parse(params.get("genre") || ""),
    type: z
      .enum(["all", "movie", "tv"])
      .catch("all")
      .parse(params.get("type") || "all"),
    rating: ratingSchema.parse(params.get("rating") || "0"),
    year: yearSchema.parse(params.get("year") || "all"),
    language: z
      .enum(["all", "en", "fr", "ja", "ko"])
      .catch("all")
      .parse(params.get("language") || "all"),
    sort: z
      .enum(["popularity", "rating", "release"])
      .catch("popularity")
      .parse(params.get("sort") || "popularity"),
  };
}
