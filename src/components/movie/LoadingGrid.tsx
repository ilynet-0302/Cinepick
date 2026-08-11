export function LoadingGrid() {
  return (
    <div className="movie-grid">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div />
          <span />
          <small />
        </div>
      ))}
    </div>
  );
}
