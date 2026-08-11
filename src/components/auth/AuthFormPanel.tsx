import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import type { FormEvent } from "react";
import type { AuthMode } from "../../features/auth/authTypes";

interface AuthFormPanelProps {
  mode: AuthMode;
  email: string;
  password: string;
  displayName: string;
  error: string;
  notice: string;
  submitting: boolean;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function AuthFormPanel(props: AuthFormPanelProps) {
  const { mode } = props;
  return (
    <section className="auth-form-panel">
      {mode !== "reset" && mode !== "recovery" && (
        <div className="auth-tabs">
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => props.onModeChange("signin")}
          >
            Sign in
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => props.onModeChange("signup")}
          >
            Create account
          </button>
        </div>
      )}
      <div className="auth-form-head">
        <span>
          {mode === "signup" ? (
            <UserRound />
          ) : mode === "reset" || mode === "recovery" ? (
            <KeyRound />
          ) : (
            <LockKeyhole />
          )}
        </span>
        <h2>
          {mode === "signup"
            ? "Create your account"
            : mode === "reset"
              ? "Request a reset link"
              : mode === "recovery"
                ? "Choose a new password"
                : "Sign in to Cinepick"}
        </h2>
        <p>
          {mode === "signup"
            ? "No email confirmation required."
            : mode === "signin"
              ? "Your saved titles are waiting."
              : "Use a strong password with at least six characters."}
        </p>
      </div>
      <form className="auth-form" onSubmit={props.onSubmit}>
        {mode === "signup" && (
          <label>
            Display name
            <div>
              <UserRound size={17} />
              <input
                required
                maxLength={60}
                value={props.displayName}
                onChange={(event) =>
                  props.onDisplayNameChange(event.target.value)
                }
                placeholder="Movie lover"
              />
            </div>
          </label>
        )}
        {mode !== "recovery" && (
          <label>
            Email address
            <div>
              <Mail size={17} />
              <input
                required
                maxLength={254}
                type="email"
                autoComplete="email"
                value={props.email}
                onChange={(event) => props.onEmailChange(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </label>
        )}
        {mode !== "reset" && (
          <label>
            {mode === "recovery" ? "New password" : "Password"}
            <div>
              <LockKeyhole size={17} />
              <input
                required
                minLength={6}
                maxLength={128}
                type="password"
                autoComplete={
                  mode === "signup" || mode === "recovery"
                    ? "new-password"
                    : "current-password"
                }
                value={props.password}
                onChange={(event) => props.onPasswordChange(event.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
          </label>
        )}
        {props.error && <p className="form-message error">{props.error}</p>}
        {props.notice && <p className="form-message success">{props.notice}</p>}
        <button className="primary-btn auth-submit" disabled={props.submitting}>
          {props.submitting
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : mode === "signin"
                ? "Sign in"
                : mode === "reset"
                  ? "Send reset link"
                  : "Update password"}{" "}
          <ArrowRight size={17} />
        </button>
      </form>
      {mode === "signin" && (
        <button
          className="forgot-link"
          onClick={() => props.onModeChange("reset")}
        >
          Forgot your password?
        </button>
      )}
      {(mode === "reset" || mode === "recovery") && (
        <button
          className="forgot-link"
          onClick={() => props.onModeChange("signin")}
        >
          Back to sign in
        </button>
      )}
    </section>
  );
}
