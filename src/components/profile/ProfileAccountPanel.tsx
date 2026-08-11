import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  displayNameSchema,
  firstValidationError,
} from "../../features/auth/authValidation";
import { useAuth } from "../../features/auth/useAuth";
import { useLibrary } from "../../features/library/useLibrary";

export function ProfileAccountPanel() {
  const auth = useAuth();
  const library = useLibrary();
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  useEffect(
    () => setDisplayName(auth.profile?.display_name || ""),
    [auth.profile?.display_name],
  );

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    const result = displayNameSchema.safeParse(displayName);
    if (!result.success) {
      setMessage(firstValidationError(result));
      return;
    }
    try {
      await auth.updateProfile(result.data);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save profile.",
      );
    }
  };

  return (
    <section className="account-panel">
      <div>
        <span className={`sync-dot ${auth.user ? "online" : ""}`} />
        <div>
          <b>{auth.user ? auth.user.email : "Not signed in"}</b>
          <small>
            {auth.user
              ? library.cloudLoading
                ? "Synchronizing account…"
                : "Library synced with Supabase"
              : "Your progress is saved only on this device"}
          </small>
        </div>
      </div>
      {auth.user ? (
        <form onSubmit={saveProfile}>
          <input
            required
            maxLength={60}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name"
          />
          <button className="secondary-btn">Save profile</button>
          <button
            type="button"
            className="text-button"
            onClick={() => auth.signOut()}
          >
            Sign out
          </button>
        </form>
      ) : (
        <Link className="primary-btn" to="/auth">
          Sign in or create account
        </Link>
      )}
      {message && <p>{message}</p>}
    </section>
  );
}
