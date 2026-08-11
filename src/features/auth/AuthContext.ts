import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "./authTypes";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  recoveryMode: boolean;
  configured: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
