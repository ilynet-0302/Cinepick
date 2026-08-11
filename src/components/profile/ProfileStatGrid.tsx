import { Award, Clock3, Film, Star } from "lucide-react";
import type { ProfileStats } from "../../features/profile/profileStats";

export function ProfileStatGrid({ stats }: { stats: ProfileStats }) {
  return (
    <div className="stat-grid">
      <article>
        <span>
          <Film size={20} />
        </span>
        <div>
          <strong>{stats.watchedCount}</strong>
          <small>Titles watched</small>
        </div>
      </article>
      <article>
        <span>
          <Clock3 size={20} />
        </span>
        <div>
          <strong>
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </strong>
          <small>Total watch time</small>
        </div>
      </article>
      <article>
        <span>
          <Star size={20} />
        </span>
        <div>
          <strong>{stats.averageRating.toFixed(1)}</strong>
          <small>Average rating</small>
        </div>
      </article>
      <article>
        <span>
          <Award size={20} />
        </span>
        <div>
          <strong>{stats.favoriteGenre}</strong>
          <small>Favorite genre</small>
        </div>
      </article>
    </div>
  );
}
