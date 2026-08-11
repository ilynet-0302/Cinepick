import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { findProfile, saveProfile } from "../../repositories/profileRepository";
import {
  changePassword,
  createAccount,
  getCurrentSession,
  requestPasswordReset,
  signInWithPassword,
  signOutAccount,
  subscribeToAuthChanges,
  updateAuthDisplayName,
} from "../../services/authService";
import { isSupabaseConfigured } from "../../services/supabase";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { Profile } from "./authTypes";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((current) => active && setSession(current))
      .catch(() => active && setSession(null))
      .finally(() => active && setLoading(false));
    const unsubscribe = subscribeToAuthChanges((event, nextSession) => {
      setSession(nextSession);
      setRecoveryMode(event === "PASSWORD_RECOVERY");
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    let active = true;
    findProfile(session.user.id)
      .then((next) => active && setProfile(next))
      .catch(() => active && setProfile(null));
    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user || null,
      session,
      profile,
      loading,
      recoveryMode,
      configured: isSupabaseConfigured,
      signUp: createAccount,
      signIn: signInWithPassword,
      signOut: signOutAccount,
      sendPasswordReset: async (email) => {
        const redirectTo = new URL(
          `${import.meta.env.BASE_URL}auth?mode=recovery`,
          window.location.origin,
        ).toString();
        await requestPasswordReset(email, redirectTo);
      },
      updatePassword: async (password) => {
        await changePassword(password);
        setRecoveryMode(false);
      },
      updateProfile: async (displayName) => {
        if (!session?.user) throw new Error("Sign in to update your profile.");
        const next = await saveProfile(session.user.id, displayName);
        await updateAuthDisplayName(displayName);
        setProfile(next);
      },
    }),
    [session, profile, loading, recoveryMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
