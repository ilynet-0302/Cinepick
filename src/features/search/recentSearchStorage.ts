import { z } from "zod";

const STORAGE_KEY = "cinepick-searches";
const searchQuerySchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .refine((value) => !/[\u0000-\u001f]/.test(value));
const recentSearchesSchema = z.array(searchQuerySchema).max(5);

export function validateSearchQuery(value: unknown): string {
  const result = searchQuerySchema.safeParse(value);
  return result.success ? result.data : "";
}

export function readRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const result = recentSearchesSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function writeRecentSearches(searches: string[]) {
  const result = recentSearchesSchema.safeParse(searches);
  if (result.success)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
}
