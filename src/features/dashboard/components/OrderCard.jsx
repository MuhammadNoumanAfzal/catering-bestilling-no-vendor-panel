export default function OrderCard({ order }) {
  return (
    <article className={`dashboard-order-card ${order.tone ?? ""}`}>
      <div className="dashboard-order-main">
        <div className="dashboard-order-heading">
          <div>
            <div className="dashboard-order-topline">
              <strong className="dashboard-order-id type-h5">{order.id}</strong>
              <span className="dashboard-order-status-badge type-subpara">{order.statusLabel}</span>
            </div>
            <h3 className="dashboard-order-title type-h4">{order.title}</h3>
          </div>
          <strong className="dashboard-order-amount type-h5">{order.amount}</strong>
        </div>

        <p className="dashboard-order-meta type-subpara">
          <span>{order.guests}</span>
          <span>{order.timing}</span>
        </p>
        <p className="dashboard-order-detail type-subpara">{order.address}</p>
      </div>

      <div className="dashboard-order-actions">
        <button className="dashboard-button dashboard-button-primary type-subpara" type="button">
          Start Preparing
        </button>
        <button className="dashboard-button dashboard-button-secondary type-subpara" type="button">
          View Details
        </button>
      </div>
    </article>
  );
}
