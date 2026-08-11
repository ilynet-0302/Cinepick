import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthSuccessProps {
  email: string;
  onSignOut: () => void;
}

export function AuthSuccess({ email, onSignOut }: AuthSuccessProps) {
  return (
    <div className="standard-page auth-page">
      <section className="auth-card auth-success">
        <span>
          <CheckCircle2 size={31} />
        </span>
        <p className="eyebrow">Signed in</p>
        <h1>Welcome back.</h1>
        <p>{email}</p>
        <div>
          <Link className="primary-btn" to="/profile">
            Open profile <ArrowRight size={17} />
          </Link>
          <button className="secondary-btn" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
