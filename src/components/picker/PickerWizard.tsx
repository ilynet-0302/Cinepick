import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dice5,
  Heart,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { genres } from "../../data/genres";
import {
  companies,
  moods,
  watchTimes,
} from "../../features/picker/pickerOptions";
import type { PickerFormState } from "../../features/picker/usePickerState";

interface PickerWizardProps {
  form: PickerFormState;
  onChange: <K extends keyof PickerFormState>(
    key: K,
    value: PickerFormState[K],
  ) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PickerWizard({
  form,
  onChange,
  onNext,
  onBack,
}: PickerWizardProps) {
  const {
    step,
    mood,
    time,
    company,
    minRating,
    genre,
    minYear,
    includeWatched,
  } = form;
  return (
    <div className="standard-page pick-page page-enter">
      <div className="pick-top">
        <Link to="/">
          <ArrowLeft size={17} /> Home
        </Link>
        <div className="step-counter">
          {[1, 2, 3, 4].map((number) => (
            <i key={number} className={number <= step ? "active" : ""} />
          ))}
          <span>{step} / 4</span>
        </div>
      </div>
      <section className="pick-card">
        <div className="pick-card-head">
          <span className="spark-icon">
            <Sparkles size={21} />
          </span>
          <p className="eyebrow">Let’s make this easy</p>
          <h1>
            {step === 1
              ? "How do you want to feel?"
              : step === 2
                ? "How much time do you have?"
                : step === 3
                  ? "Who’s watching?"
                  : "One last touch"}
          </h1>
          <p>
            {step === 1
              ? "Pick the mood you want your movie to leave you with."
              : step === 2
                ? "We’ll keep the runtime within your evening’s limits."
                : step === 3
                  ? "The right movie depends on the room."
                  : "Fine-tune the shortlist, or trust our defaults."}
          </p>
        </div>
        {step === 1 && (
          <div className="choice-grid mood-grid">
            {moods.map((item) => (
              <button
                key={item.value}
                className={mood === item.value ? "active" : ""}
                onClick={() => onChange("mood", item.value)}
              >
                <span>{item.emoji}</span>
                {item.value}
                {mood === item.value && <Check size={16} />}
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="choice-grid time-grid">
            {watchTimes.map((item) => (
              <button
                key={item.value}
                className={time === item.value ? "active" : ""}
                onClick={() => onChange("time", item.value)}
              >
                <b>{item.label}</b>
                <small>{item.sub}</small>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="choice-grid company-grid">
            {companies.map((item) => (
              <button
                key={item.value}
                className={company === item.value ? "active" : ""}
                onClick={() => onChange("company", item.value)}
              >
                <span>{item.icon}</span>
                <b>{item.label}</b>
              </button>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="fine-tune">
            <label>
              Minimum rating <b>{minRating.toFixed(1)}+</b>
              <input
                type="range"
                min="5"
                max="9"
                step="0.5"
                value={minRating}
                onChange={(event) =>
                  onChange("minRating", Number(event.target.value))
                }
              />
            </label>
            <label>
              Preferred genre
              <select
                value={genre}
                onChange={(event) => onChange("genre", event.target.value)}
              >
                {genres.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Released after
              <select
                value={minYear}
                onChange={(event) =>
                  onChange("minYear", Number(event.target.value))
                }
              >
                <option value="0">Any year</option>
                <option value="2020">2020</option>
                <option value="2015">2015</option>
                <option value="2010">2010</option>
                <option value="2000">2000</option>
                <option value="1990">1990</option>
              </select>
            </label>
            <label className="toggle-label">
              <span>
                <Heart size={18} /> Include movies I’ve watched
              </span>
              <input
                type="checkbox"
                checked={includeWatched}
                onChange={(event) =>
                  onChange("includeWatched", event.target.checked)
                }
              />
            </label>
          </div>
        )}
        <div className="pick-footer">
          <button
            className="text-button"
            disabled={step === 1}
            onClick={onBack}
          >
            Back
          </button>
          <button
            className="primary-btn"
            disabled={
              (step === 1 && !mood) ||
              (step === 2 && !time) ||
              (step === 3 && !company)
            }
            onClick={onNext}
          >
            {step === 4 ? (
              <>
                <Dice5 size={18} /> Pick my movies
              </>
            ) : (
              <>
                Continue <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
