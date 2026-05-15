import { BadgeCheck, Bike, ChefHat } from "lucide-react";

const iconMap = {
  chef: ChefHat,
  check: BadgeCheck,
  delivery: Bike,
};

export default function KitchenStatus({ items }) {
  return (
    <>
      <p className="dashboard-status-caption type-subpara">
        Live overview of your current operations
      </p>
      <div className="dashboard-status-grid">
        {items.map((item) => {
          const Icon = iconMap[item.icon];

          return (
            <article key={item.label} className={`dashboard-status-card ${item.tone}`}>
              <span className="dashboard-status-title type-subpara">{item.label}</span>
              <strong className="dashboard-status-value type-h1">{item.value}</strong>
              <div className="dashboard-status-footer">
                <span className="dashboard-status-label type-subpara">{item.sublabel}</span>
                {Icon ? <Icon className="dashboard-status-icon" size={14} strokeWidth={2} /> : null}
              </div>
            </article>
          );
        })}
      </div>
      <button className="dashboard-status-link type-subpara" type="button">
        Go to Orders
      </button>
    </>
  );
}
