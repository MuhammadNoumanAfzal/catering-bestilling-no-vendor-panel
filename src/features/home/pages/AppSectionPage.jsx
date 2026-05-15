export default function AppSectionPage({ title, description }) {
  return (
    <section className="app-section-placeholder">
      <div className="app-section-placeholder-card">
        <p className="app-section-kicker type-subpara">Shared app layout</p>
        <h1 className="app-section-title type-h3">{title}</h1>
        <p className="app-section-description type-para">{description}</p>
      </div>
    </section>
  );
}
