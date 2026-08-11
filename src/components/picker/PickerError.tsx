interface PickerErrorProps {
  onRetry: () => void;
  onChangeAnswers: () => void;
}

export function PickerError({ onRetry, onChangeAnswers }: PickerErrorProps) {
  return (
    <div className="standard-page pick-results page-enter">
      <div className="empty-state">
        <span>↻</span>
        <h1>We couldn’t make the shortlist</h1>
        <p>Check your TMDB connection or try the request again.</p>
        <button className="primary-btn" onClick={onRetry}>
          Try again
        </button>
        <button className="text-button" onClick={onChangeAnswers}>
          Change my answers
        </button>
      </div>
    </div>
  );
}
