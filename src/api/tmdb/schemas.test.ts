import { describe, expect, it } from "vitest";
import { tmdbResultsSchema, tmdbTitleDetailsSchema } from "./schemas";

describe("TMDB schemas", () => {
  it("normalizes optional result fields to safe defaults", () => {
    const result = tmdbResultsSchema.parse({
      results: [{ id: 42, poster_path: "/poster.jpg" }],
    });
    expect(result.total_pages).toBe(1);
    expect(result.results[0]).toMatchObject({
      id: 42,
      vote_average: 0,
      genre_ids: [],
      original_language: "en",
      poster_path: "/poster.jpg",
    });
  });

  it("rejects media without a positive numeric id", () => {
    const result = tmdbResultsSchema.safeParse({ results: [{ id: "42" }] });
    expect(result.success).toBe(false);
  });

  it("provides safe collections for title details", () => {
    const result = tmdbTitleDetailsSchema.parse({ id: 7 });
    expect(result.credits).toEqual({ cast: [], crew: [] });
    expect(result.production_companies).toEqual([]);
  });

  it("accepts person entries returned by multi-search before they are filtered", () => {
    const result = tmdbResultsSchema.parse({
      results: [{ id: 9, media_type: "person" }],
    });
    expect(result.results[0].media_type).toBe("person");
  });
});
