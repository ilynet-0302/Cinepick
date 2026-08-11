import { z } from "zod";
import type { Profile } from "../features/auth/authTypes";
import { supabase } from "../services/supabase";

const profileSchema = z.object({
  id: z.uuid(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

function parseProfile(data: unknown): Profile {
  const result = profileSchema.safeParse(data);
  if (!result.success)
    throw new Error("Profile data has an unexpected format.");
  return result.data;
}

export async function findProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? parseProfile(data) : null;
}

export async function saveProfile(
  userId: string,
  displayName: string,
): Promise<Profile> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, display_name: displayName })
    .select("id, display_name, avatar_url")
    .single();
  if (error) throw error;
  return parseProfile(data);
}
