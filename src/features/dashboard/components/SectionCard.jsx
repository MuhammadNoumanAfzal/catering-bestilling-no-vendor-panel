export default function SectionCard({ title, actionLabel, badgeCount, children }) {
  return (
    <section className="dashboard-section-card">
      <div className="dashboard-section-head">
        <div className="dashboard-section-title-wrap">
          <h2 className="dashboard-section-title type-h5">{title}</h2>
          {badgeCount ? <span className="dashboard-section-badge type-subpara">{badgeCount}</span> : null}
        </div>
        {actionLabel ? (
          <button className="dashboard-inline-link type-subpara" type="button">
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
