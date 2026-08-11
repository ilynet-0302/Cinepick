import { SlidersHorizontal } from "lucide-react";

interface DiscoverFiltersPanelProps {
  type: "all" | "movie" | "tv";
  year: string;
  language: "all" | "en" | "fr" | "ja" | "ko";
  minRating: number;
  sort: "popularity" | "rating" | "release";
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function DiscoverFiltersPanel({
  type,
  year,
  language,
  minRating,
  sort,
  onChange,
  onReset,
}: DiscoverFiltersPanelProps) {
  return (
    <aside className="filters-panel">
      <div className="filter-title">
        <span>
          <SlidersHorizontal size={18} /> Filters
        </span>
        <button onClick={onReset}>Reset</button>
      </div>
      <label>
        Type
        <select
          value={type}
          onChange={(event) => onChange("type", event.target.value)}
        >
          <option value="all">Movies & TV</option>
          <option value="movie">Movies</option>
          <option value="tv">TV shows</option>
        </select>
      </label>
      <label>
        Release
        <select
          value={year}
          onChange={(event) => onChange("year", event.target.value)}
        >
          <option value="all">Any year</option>
          <option value="2020s">2020 — now</option>
          <option value="2010s">2010 — 2019</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2014">2014</option>
        </select>
      </label>
      <label>
        Language
        <select
          value={language}
          onChange={(event) => onChange("language", event.target.value)}
        >
          <option value="all">Any language</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
        </select>
      </label>
      <label>
        Minimum rating
        <div className="range-label">
          <input
            type="range"
            min="0"
            max="9"
            step="0.5"
            value={minRating}
            onChange={(event) => onChange("rating", event.target.value)}
          />
          <b>{minRating ? `${minRating}+` : "Any"}</b>
        </div>
      </label>
      <label>
        Sort by
        <select
          value={sort}
          onChange={(event) => onChange("sort", event.target.value)}
        >
          <option value="popularity">Most popular</option>
          <option value="rating">Highest rated</option>
          <option value="release">Newest first</option>
        </select>
      </label>
    </aside>
  );
}
