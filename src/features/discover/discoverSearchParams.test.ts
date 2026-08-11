import { describe, expect, it } from "vitest";
import { genreIds } from "../../data/genres";
import { parseDiscoverSearchParams } from "./discoverSearchParams";

describe("discover search params", () => {
  it("parses supported filters", () => {
    const params = new URLSearchParams({
      type: "movie",
      rating: "7.5",
      genre: String(genreIds.Drama),
      sort: "rating",
    });
    expect(parseDiscoverSearchParams(params)).toMatchObject({
      type: "movie",
      rating: 7.5,
      genre: String(genreIds.Drama),
      sort: "rating",
    });
  });

  it("falls back safely for unsupported URL values", () => {
    const params = new URLSearchParams({
      type: "book",
      rating: "99",
      genre: "not-a-genre",
      sort: "random",
    });
    expect(parseDiscoverSearchParams(params)).toMatchObject({
      type: "all",
      rating: 0,
      genre: "",
      sort: "popularity",
    });
  });
});
