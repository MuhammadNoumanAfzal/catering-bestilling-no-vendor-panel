import {
  ArrowUp,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleAlert,
  ClipboardList,
} from "lucide-react";

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
  helperTone,
  icon,
  onClick,
  variant,
  progress,
  trend,
  trendValue,
  timeLabel,
}) {
  const Icon = iconMap[icon];
  const hasTrendBadge = trendValue && (trend === "up" || trend === "down");

  return (
    <button
      className={`relative min-h-[120px] w-full cursor-pointer overflow-hidden rounded-[10px] border border-[#e8e2da] bg-white px-3 pb-[14px] pt-3 text-left shadow-[0_1px_2px_rgba(38,23,14,0.08),0_6px_14px_rgba(38,23,14,0.06)] transition hover:translate-y-[-1px] max-[720px]:min-h-[105px] max-[720px]:px-3 max-[720px]:pb-3 max-[720px]:pt-3 ${
        variant === "capacity" ? "pb-3" : ""
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#fff4ef]">
        {Icon ? <Icon className="text-[#d66c3a]" size={24} strokeWidth={2.2} /> : null}
      </div>
      <p className="type-para mt-2 text-[13px] font-bold leading-[1.35] ">{label}</p>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <strong className="type-h2 block text-[34px] leading-none text-[#16110d] max-[720px]:text-[28px]">
          {value}
        </strong>
        {hasTrendBadge ? (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-[2px] text-[10px] font-bold ${
              trend === "up"
                ? "bg-[#eafbf0] text-[#2ebd5e]"
                : "bg-[#fdf2f1] text-[#e54a3b]"
            }`}
          >
            {trend === "up" ? "↑ " : "↓ "}
            {trendValue}
          </span>
        ) : null}
      </div>

      {variant === "capacity" ? (
        <div className="mt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2e2e2]" aria-hidden="true">
            <div
              className="h-full rounded-full bg-[#2fbe5b]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="type-para mt-1.5 text-[13px] font-medium leading-[1.35] ">
            {helper}
          </p>
        </div>
      ) : (
        <p className="type-para mt-2.5 flex items-center gap-[5px] text-[13px] font-medium leading-[1.35] ">
          {helperTone === "is-positive" ? (
            <span className="inline-flex shrink-0 text-[#2fbe5b]">
              <ArrowUp size={14} strokeWidth={2.2} />
            </span>
          ) : null}
          {helper}
        </p>
      )}

      {timeLabel ? (
        <p className="type-para mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#8d7e72]">
          <span className="text-[8px]">•</span> {timeLabel}
        </p>
      ) : null}
    </button>
  );
}
