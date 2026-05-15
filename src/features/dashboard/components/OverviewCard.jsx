import { CalendarDays, ChartNoAxesColumnIncreasing, CircleAlert, ClipboardList } from "lucide-react";

const iconMap = {
  calendar: CalendarDays,
  clipboard: ClipboardList,
  alert: CircleAlert,
  gauge: ChartNoAxesColumnIncreasing,
};

export default function OverviewCard({
  label,
  value,
  helper,
  accent,
  helperTone,
  icon,
  variant,
  progress,
}) {
  const Icon = iconMap[icon];

  return (
    <article className={`dashboard-overview-card ${accent ?? ""} ${variant ?? ""}`}>
      <div className="dashboard-card-icon-wrap">
        {Icon ? <Icon className="dashboard-card-icon" size={16} strokeWidth={2.2} /> : null}
      </div>
      <p className="dashboard-card-label type-para">{label}</p>
      <strong className="dashboard-card-value type-h2">{value}</strong>
      {variant === "capacity" ? (
        <div className="dashboard-card-capacity">
          <div className="dashboard-card-progress-track" aria-hidden="true">
            <div className="dashboard-card-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="dashboard-card-helper type-para">{helper}</p>
        </div>
      ) : (
        <p className={`dashboard-card-helper type-para ${helperTone ?? ""}`}>{helper}</p>
      )}
    </article>
  );
}
