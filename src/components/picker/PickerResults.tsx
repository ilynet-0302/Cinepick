import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getMatchReasons,
  type PickCriteria,
} from "../../features/picker/recommendationEngine";
import { companies, watchTimes } from "../../features/picker/pickerOptions";
import type { Movie } from "../../types";
import { MovieCard } from "../movie/MovieCard";

interface PickerResultsProps {
  picks: Movie[];
  criteria: PickCriteria;
  mood: string;
  time: string;
  company: string;
  minRating: number;
  isFetching: boolean;
  onPickAgain: () => void;
  onChangeAnswers: () => void;
}

export function PickerResults(props: PickerResultsProps) {
  return (
    <div className="standard-page pick-results page-enter">
      <div className="pick-result-head">
        <span className="spark-icon large">
          <Sparkles size={28} />
        </span>
        <p className="eyebrow">
          Chosen for your {props.mood.toLowerCase() || "movie"} mood
        </p>
        <h1>Your three for tonight</h1>
        <p>
          A ranked shortlist built entirely from live TMDB results and every
          answer you gave us.
        </p>
        <div className="picker-summary">
          <span>{props.mood}</span>
          <span>
            {watchTimes.find((item) => item.value === props.time)?.label}
          </span>
          <span>
            {companies.find((item) => item.value === props.company)?.label}
          </span>
          <span>{props.minRating.toFixed(1)}+ rated</span>
        </div>
      </div>
      {props.picks.length ? (
        <>
          <div className={`pick-grid ${props.isFetching ? "refreshing" : ""}`}>
            {props.picks.map((movie) => (
              <div key={movie.id}>
                <MovieCard movie={movie} />
                <div className="match-reasons">
                  {getMatchReasons(movie, props.criteria).map((reason) => (
                    <span key={reason}>{reason}</span>
                  ))}
                </div>
                <Link className="watch-this" to={`/${movie.type}/${movie.id}`}>
                  Watch this <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
          <div className="result-actions">
            <button
              className="secondary-btn"
              disabled={props.isFetching}
              onClick={props.onPickAgain}
            >
              <RefreshCw size={17} />{" "}
              {props.isFetching ? "Finding more…" : "Give me three more"}
            </button>
            <button className="text-button" onClick={props.onChangeAnswers}>
              Change my answers
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h2>No matches yet</h2>
          <p>Try lowering the minimum rating or changing the runtime.</p>
          <button className="primary-btn" onClick={props.onChangeAnswers}>
            Change my answers
          </button>
        </div>
      )}
    </div>
  );
}
