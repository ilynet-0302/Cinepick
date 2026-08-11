import { Sparkles } from "lucide-react";

export function PickerLoading() {
  return (
    <div className="standard-page pick-results page-enter">
      <div className="pick-result-head">
        <span className="spark-icon large">
          <Sparkles size={28} />
        </span>
        <p className="eyebrow">Reading the room</p>
        <h1>Picking your three…</h1>
        <p>Matching mood, runtime, company, rating, and watch history.</p>
      </div>
      <div className="pick-loading">
        {[1, 2, 3].map((item) => (
          <div key={item}>
            <i />
            <span />
            <small />
          </div>
        ))}
      </div>
    </div>
  );
}
