export default function EarningChart({ values }) {
  return (
    <>
      <p className="dashboard-chart-caption type-subpara">
        Revenue performance over the last 7 days
      </p>
      <div className="dashboard-chart">
        <div className="dashboard-chart-scale">
          <span className="type-subpara">$10000</span>
          <span className="type-subpara">$7500</span>
          <span className="type-subpara">$5000</span>
          <span className="type-subpara">$2500</span>
          <span className="type-subpara">$0</span>
        </div>

        <div className="dashboard-chart-plot">
          <div className="dashboard-chart-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="dashboard-chart-bars">
            {values.map((item) => (
              <div key={item.month} className="dashboard-chart-column">
                <div className="dashboard-chart-bar-wrap">
                  <div className="dashboard-chart-bar" style={{ height: `${item.value}%` }} />
                </div>
                <span className="dashboard-chart-label type-subpara">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
