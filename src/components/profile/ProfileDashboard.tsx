import { BarChart3 } from "lucide-react";
import type { ProfileStats } from "../../features/profile/profileStats";

export function ProfileDashboard({ stats }: { stats: ProfileStats }) {
  return (
    <div className="dashboard-grid">
      <section className="dashboard-card dna-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Taste breakdown</p>
            <h2>Genre DNA</h2>
          </div>
          <BarChart3 size={20} />
        </div>
        {stats.genreStats.length ? (
          <div className="bar-chart">
            {stats.genreStats.map(([genre, value], index) => (
              <div key={genre}>
                <span>{genre}</span>
                <div>
                  <i
                    style={{
                      width: `${(value / stats.genreMax) * 100}%`,
                      opacity: 1 - index * 0.12,
                    }}
                  />
                </div>
                <b>{Math.round((value / stats.genreTotal) * 100)}%</b>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Mark titles as watched to build your profile.</p>
        )}
      </section>
      <section className="dashboard-card decade-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Across the years</p>
            <h2>Favorite eras</h2>
          </div>
        </div>
        <div
          className="donut"
          style={
            { "--p": `${stats.twentyTwentiesPercent}%` } as React.CSSProperties
          }
        >
          <div>
            <strong>{stats.twentyTwentiesPercent}%</strong>
            <span>2020s</span>
          </div>
        </div>
        <div className="legend">
          <span>
            <i /> 2020s
          </span>
          <span>
            <i /> Other eras
          </span>
        </div>
      </section>
      <section className="dashboard-card directors-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Your creative circle</p>
            <h2>Top directors</h2>
          </div>
        </div>
        {stats.directors.map(([name, count], index) => (
          <div className="director-row" key={name}>
            <span>{index + 1}</span>
            <b>{name}</b>
            <small>
              {count} {count === 1 ? "title" : "titles"}
            </small>
          </div>
        ))}
      </section>
      <section className="dashboard-card activity-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">At a glance</p>
            <h2>Collection balance</h2>
          </div>
        </div>
        <div className="activity-bars">
          {stats.collection.map((item) => (
            <div key={item.label}>
              <i
                style={{
                  height: `${Math.max((item.value / stats.collectionMax) * 100, 3)}%`,
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
