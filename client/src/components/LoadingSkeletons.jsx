function CreatorGridSkeleton({ count = 3, className = "" }) {
  return (
    <div
      className={`creator-skeleton-grid${className ? ` ${className}` : ""}`}
      role="status"
      aria-label="Loading creators"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="creator-card-skeleton" key={index} aria-hidden="true">
          <span className="skeleton-avatar" />
          <span className="skeleton-chip" />
          <span className="skeleton-line skeleton-line-short" />
          <span className="skeleton-line" />
          <span className="skeleton-line skeleton-line-medium" />
          <span className="skeleton-action" />
        </div>
      ))}
    </div>
  );
}

function PortfolioGridSkeleton({ count = 3 }) {
  return (
    <div
      className="post-grid portfolio-skeleton-grid"
      role="status"
      aria-label="Loading portfolio"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="post-card-skeleton" key={index} aria-hidden="true">
          <span className="skeleton-media" />
          <span className="skeleton-line skeleton-line-medium" />
          <span className="skeleton-line" />
          <span className="skeleton-line skeleton-line-short" />
        </div>
      ))}
    </div>
  );
}

export { CreatorGridSkeleton, PortfolioGridSkeleton };
