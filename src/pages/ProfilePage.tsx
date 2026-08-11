import { useQuery } from "@tanstack/react-query";
import { getTitlesByKeys } from "../api/tmdb";
import { ProfileAccountPanel } from "../components/profile/ProfileAccountPanel";
import { ProfileDashboard } from "../components/profile/ProfileDashboard";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileStatGrid } from "../components/profile/ProfileStatGrid";
import { useLibrary } from "../features/library/useLibrary";
import { useAuth } from "../features/auth/useAuth";
import { buildProfileStats } from "../features/profile/profileStats";

export default function ProfilePage() {
  const library = useLibrary();
  const auth = useAuth();
  const { data: watched = [] } = useQuery({
    queryKey: ["profile-watched", library.watched],
    queryFn: () => getTitlesByKeys(library.watched),
    enabled: library.watched.length > 0,
  });
  const stats = buildProfileStats(watched, library.ratings, {
    watchlist: library.watchlist.length,
    favorite: library.favorite.length,
    watched: library.watched.length,
  });
  const accountName =
    auth.profile?.display_name || auth.user?.email?.split("@")[0] || "Guest";

  return (
    <div className="standard-page profile-page page-enter">
      <ProfileHeader accountName={accountName} signedIn={Boolean(auth.user)} />
      <ProfileAccountPanel />
      <ProfileStatGrid stats={stats} />
      <ProfileDashboard stats={stats} />
    </div>
  );
}
