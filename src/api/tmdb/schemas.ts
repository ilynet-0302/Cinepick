import { z } from "zod";

const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value ?? null);
const optionalString = z.string().optional();
const safeNumber = z
  .number()
  .finite()
  .nullish()
  .transform((value) => value ?? 0);

export const tmdbMediaSchema = z.object({
  id: z.number().int().positive(),
  title: nullableString,
  name: nullableString,
  original_title: nullableString,
  original_name: nullableString,
  media_type: z.enum(["movie", "tv", "person"]).optional(),
  release_date: nullableString,
  first_air_date: nullableString,
  vote_average: safeNumber,
  vote_count: safeNumber,
  genre_ids: z.array(z.number().int().positive()).default([]),
  original_language: z
    .string()
    .nullish()
    .transform((value) => value ?? "en"),
  overview: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  poster_path: nullableString,
  backdrop_path: nullableString,
  popularity: safeNumber,
});

export const tmdbResultsSchema = z.object({
  results: z.array(tmdbMediaSchema).default([]),
  total_pages: z.number().int().positive().default(1),
});

export const tmdbCreditPersonSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .nullish()
    .transform((value) => value ?? "Unknown"),
  character: optionalString,
  job: optionalString,
  profile_path: nullableString,
});

export const tmdbTitleDetailsSchema = tmdbMediaSchema.extend({
  genres: z
    .array(z.object({ id: z.number().int().positive(), name: z.string() }))
    .default([]),
  credits: z
    .object({
      cast: z.array(tmdbCreditPersonSchema).default([]),
      crew: z.array(tmdbCreditPersonSchema).default([]),
    })
    .default({ cast: [], crew: [] }),
  runtime: safeNumber,
  episode_run_time: z.array(safeNumber).default([]),
  production_countries: z.array(z.object({ name: z.string() })).default([]),
  production_companies: z.array(z.object({ name: z.string() })).default([]),
  budget: safeNumber,
  revenue: safeNumber,
});

export const tmdbPersonSummarySchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .nullish()
    .transform((value) => value ?? "Unknown"),
  known_for_department: z
    .string()
    .nullish()
    .transform((value) => value ?? "Known for"),
  profile_path: nullableString,
});

export const tmdbPeopleResultsSchema = z.object({
  results: z.array(tmdbPersonSummarySchema).default([]),
});

export const tmdbPersonDetailsSchema = tmdbPersonSummarySchema.extend({
  biography: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  birthday: nullableString,
  combined_credits: z
    .object({
      cast: z.array(tmdbMediaSchema).default([]),
    })
    .default({ cast: [] }),
});

export type TmdbMedia = z.infer<typeof tmdbMediaSchema>;
export type TmdbResults = z.infer<typeof tmdbResultsSchema>;
