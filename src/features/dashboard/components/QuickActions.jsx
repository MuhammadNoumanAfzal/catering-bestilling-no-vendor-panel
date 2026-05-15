import { CalendarDays, CircleAlert, Plus } from "lucide-react";

const iconMap = {
  plus: Plus,
  calendar: CalendarDays,
  alert: CircleAlert,
};

export default function QuickActions({ actions }) {
  return (
    <div className="dashboard-action-list">
      {actions.map((action) => {
        const Icon = iconMap[action.icon];

        return (
          <button key={action.label} className="dashboard-action-button type-para" type="button">
            <span className="dashboard-action-button-inner">
              {Icon ? <Icon size={14} strokeWidth={2.2} /> : null}
              <span>{action.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
