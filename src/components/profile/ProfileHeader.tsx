import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  accountName: string;
  signedIn: boolean;
}

export function ProfileHeader({ accountName, signedIn }: ProfileHeaderProps) {
  return (
    <section className="profile-head">
      <div className="big-avatar">{accountName.slice(0, 2).toUpperCase()}</div>
      <div>
        <p className="eyebrow">
          {signedIn ? "Cloud profile" : "Guest profile"}
        </p>
        <h1>Your movie DNA</h1>
        <p>
          Your taste profile evolves every time you watch, love, and rate a
          story.
        </p>
      </div>
      <Link to="/library" className="secondary-btn">
        View library <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
