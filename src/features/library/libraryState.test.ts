import { describe, expect, it } from "vitest";
import {
  createInitialLibraryState,
  libraryFromMediaStates,
  mergeLibraries,
} from "./libraryState";
import { libraryStateSchema } from "./libraryStorage";

describe("library state", () => {
  it("merges lists, prefers cloud ratings, and keeps the furthest progress", () => {
    const local = createInitialLibraryState();
    local.watchlist = ["movie:1"];
    local.ratings["movie:1"] = 6;
    local.progress["movie:1"] = 75;
    const cloud = createInitialLibraryState();
    cloud.favorite = ["movie:1"];
    cloud.ratings["movie:1"] = 8;
    cloud.progress["movie:1"] = 40;

    expect(mergeLibraries(local, cloud)).toEqual({
      watchlist: ["movie:1"],
      favorite: ["movie:1"],
      watched: [],
      ratings: { "movie:1": 8 },
      progress: { "movie:1": 75 },
    });
  });

  it("maps repository media state into the domain state", () => {
    const result = libraryFromMediaStates(
      new Map([
        [
          "tv:9",
          {
            inWatchlist: true,
            isFavorite: false,
            isWatched: true,
            rating: 9,
            progress: 100,
          },
        ],
      ]),
    );
    expect(result.watchlist).toEqual(["tv:9"]);
    expect(result.watched).toEqual(["tv:9"]);
    expect(result.ratings["tv:9"]).toBe(9);
  });

  it("rejects malformed persisted state", () => {
    expect(
      libraryStateSchema.safeParse({
        watchlist: ["invalid"],
        ratings: {},
        progress: {},
      }).success,
    ).toBe(false);
    expect(
      libraryStateSchema.safeParse({
        watchlist: [],
        ratings: { "movie:1": 20 },
        progress: {},
      }).success,
    ).toBe(false);
  });
});
