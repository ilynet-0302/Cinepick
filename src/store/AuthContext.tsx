import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  recoveryMode: boolean;
  configured: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setRecoveryMode(event === 'PASSWORD_RECOVERY');
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) { setProfile(null); return; }
    supabase.from('profiles').select('id, display_name, avatar_url').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => setProfile(data as Profile | null));
  }, [session?.user]);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user || null, session, profile, loading, recoveryMode, configured: isSupabaseConfigured,
    signUp: async (email, password, displayName) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
      if (error) throw error;
      return { needsConfirmation: !data.session };
    },
    signIn: async (email, password) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    sendPasswordReset: async (email) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const recoveryUrl = new URL(`${import.meta.env.BASE_URL}auth?mode=recovery`, window.location.origin).toString();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: recoveryUrl });
      if (error) throw error;
    },
    updatePassword: async (password) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setRecoveryMode(false);
    },
    updateProfile: async (displayName) => {
      if (!supabase || !session?.user) throw new Error('Sign in to update your profile.');
      const { data, error } = await supabase.from('profiles').upsert({ id: session.user.id, display_name: displayName }).select('id, display_name, avatar_url').single();
      if (error) throw error;
      await supabase.auth.updateUser({ data: { display_name: displayName } });
      setProfile(data as Profile);
    },
  }), [session, profile, loading, recoveryMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
