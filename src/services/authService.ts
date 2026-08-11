import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

function configuredClient() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

export async function createAccount(
  email: string,
  password: string,
  displayName: string,
) {
  const { data, error } = await configuredClient().auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return { needsConfirmation: !data.session };
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await configuredClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
}

export async function signOutAccount() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { error } = await configuredClient().auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
}

export async function changePassword(password: string) {
  const { error } = await configuredClient().auth.updateUser({ password });
  if (error) throw error;
}

export async function updateAuthDisplayName(displayName: string) {
  const { error } = await configuredClient().auth.updateUser({
    data: { display_name: displayName },
  });
  if (error) throw error;
}
