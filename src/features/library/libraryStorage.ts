import { z } from "zod";
import { createInitialLibraryState } from "./libraryState";
import type { LibraryState } from "./libraryTypes";

const STORAGE_KEY = "cinepick-library-v2";
const mediaKeySchema = z.string().regex(/^(movie|tv):[1-9]\d*$/);

export const libraryStateSchema = z.object({
  watchlist: z.array(mediaKeySchema).default([]),
  favorite: z.array(mediaKeySchema).default([]),
  watched: z.array(mediaKeySchema).default([]),
  ratings: z
    .record(mediaKeySchema, z.number().int().min(1).max(10))
    .default({}),
  progress: z
    .record(mediaKeySchema, z.number().int().min(0).max(100))
    .default({}),
});

export function readLibrary(): LibraryState {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return createInitialLibraryState();
    const result = libraryStateSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : createInitialLibraryState();
  } catch {
    return createInitialLibraryState();
  }
}

export function writeLibrary(state: LibraryState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearStoredLibrary() {
  localStorage.removeItem(STORAGE_KEY);
}
