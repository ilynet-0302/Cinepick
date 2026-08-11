import { z } from "zod";
import { supabase } from "../../services/supabase";

export async function requestTmdb<T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!supabase) throw new Error("Configure Supabase to load TMDB data.");

  const { data, error } = await supabase.functions.invoke("tmdb-proxy", {
    body: { path },
  });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 404) throw new Error("TMDB title not found.");
    if (status === 429)
      throw new Error("Too many requests. Please try again shortly.");
    throw new Error("Could not reach TMDB.");
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Invalid TMDB response", result.error.issues);
    throw new Error("TMDB returned data in an unexpected format.");
  }
  return result.data;
}
