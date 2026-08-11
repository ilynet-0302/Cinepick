export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export type AuthMode = "signin" | "signup" | "reset" | "recovery";
