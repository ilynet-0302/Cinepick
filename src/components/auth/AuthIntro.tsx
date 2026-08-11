import { Logo } from "../navigation/Logo";
import type { AuthMode } from "../../features/auth/authTypes";

export function AuthIntro({ mode }: { mode: AuthMode }) {
  return (
    <section className="auth-intro">
      <Logo />
      <div>
        <p className="eyebrow">Your stories, everywhere</p>
        <h1>
          {mode === "signup"
            ? "Build your movie DNA."
            : mode === "reset" || mode === "recovery"
              ? "Reset your password."
              : "Welcome back."}
        </h1>
        <p>
          Sync your watchlist, favorites, ratings, and viewing progress securely
          across devices.
        </p>
      </div>
      <blockquote>
        “The more you track, the sharper your recommendations become.”
      </blockquote>
    </section>
  );
}
