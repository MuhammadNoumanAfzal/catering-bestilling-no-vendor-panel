import { CalendarDays, CircleAlert, Plus } from "lucide-react";

const iconMap = {
  plus: Plus,
  calendar: CalendarDays,
  alert: CircleAlert,
};

export default function QuickActions({ actions }) {
  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) => {
        const Icon = iconMap[action.icon];

        return (
          <button
            key={action.label}
            className="type-para min-h-10 rounded-md border border-[#d8d8d8] bg-white px-[14px] text-[#241913]"
            type="button"
          >
            <span className="inline-flex cursor-pointer items-center justify-center gap-1.5 font-bold">
              {Icon ? <Icon size={14} strokeWidth={2.2} /> : null}
              <span>{action.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
