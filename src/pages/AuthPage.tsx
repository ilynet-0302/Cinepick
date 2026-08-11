import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthFormPanel } from "../components/auth/AuthFormPanel";
import { AuthIntro } from "../components/auth/AuthIntro";
import { AuthSuccess } from "../components/auth/AuthSuccess";
import { useAuth } from "../features/auth/useAuth";
import {
  displayNameSchema,
  emailSchema,
  firstValidationError,
  passwordSchema,
} from "../features/auth/authValidation";
import type { AuthMode } from "../features/auth/authTypes";

export default function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    params.get("mode") === "recovery" ? "recovery" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth.recoveryMode) setMode("recovery");
  }, [auth.recoveryMode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const validatedEmail = emailSchema.safeParse(email);
    const validatedPassword = passwordSchema.safeParse(password);
    const validatedDisplayName = displayNameSchema.safeParse(displayName);
    if (mode !== "recovery" && !validatedEmail.success) {
      setError(firstValidationError(validatedEmail));
      return;
    }
    if (mode !== "reset" && !validatedPassword.success) {
      setError(firstValidationError(validatedPassword));
      return;
    }
    if (mode === "signup" && !validatedDisplayName.success) {
      setError(firstValidationError(validatedDisplayName));
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const result = await auth.signUp(
          validatedEmail.data!,
          validatedPassword.data!,
          validatedDisplayName.data!,
        );
        if (result.needsConfirmation)
          setNotice(
            "Account created. Email confirmation is still enabled in your Supabase dashboard.",
          );
        else navigate("/profile");
      } else if (mode === "signin") {
        await auth.signIn(validatedEmail.data!, validatedPassword.data!);
        navigate("/profile");
      } else if (mode === "reset") {
        await auth.sendPasswordReset(validatedEmail.data!);
        setNotice("Password reset link sent.");
      } else {
        await auth.updatePassword(validatedPassword.data!);
        setNotice("Password updated. You can continue to your profile.");
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth.configured)
    return (
      <div className="standard-page empty-state">
        <h1>Supabase isn’t configured</h1>
        <p>Add the URL and publishable key to `.env`, then restart the app.</p>
      </div>
    );
  if (auth.user && mode !== "recovery")
    return (
      <AuthSuccess
        email={auth.user.email || ""}
        onSignOut={() => auth.signOut()}
      />
    );

  return (
    <div className="standard-page auth-page page-enter">
      <AuthIntro mode={mode} />
      <AuthFormPanel
        mode={mode}
        email={email}
        password={password}
        displayName={displayName}
        error={error}
        notice={notice}
        submitting={submitting}
        onModeChange={setMode}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onDisplayNameChange={setDisplayName}
        onSubmit={submit}
      />
    </div>
  );
}
