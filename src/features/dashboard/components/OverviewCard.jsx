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
  helperTone,
  icon,
  variant,
  progress,
}) {
  const Icon = iconMap[icon];

  return (
    <article
      className={`relative min-h-[102px] overflow-hidden rounded-[10px] border border-[#e8e2da] bg-white px-3 pb-[14px] pt-3 shadow-[0_1px_2px_rgba(38,23,14,0.08),0_6px_14px_rgba(38,23,14,0.06)] ${
        variant === "capacity" ? "pb-3" : ""
      }`}
    >
      <div className="inline-flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#fff4ef]">
        {Icon ? <Icon className="text-[#d66c3a]" size={16} strokeWidth={2.2} /> : null}
      </div>
      <p className="type-para mt-2 text-[13px] font-bold leading-[1.35] text-[#18120e]">{label}</p>
      <strong className="type-h2 mt-2 block text-[34px] leading-none text-[#16110d]">{value}</strong>
      {variant === "capacity" ? (
        <div className="mt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2e2e2]" aria-hidden="true">
            <div
              className="h-full rounded-full bg-[#2fbe5b]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="type-para mt-1.5 text-[13px] font-medium leading-[1.35] text-[#6f645b]">
            {helper}
          </p>
        </div>
      ) : (
        <p className="type-para mt-2.5 flex items-center gap-[5px] text-[13px] font-medium leading-[1.35] text-[#6f645b]">
          {helperTone === "is-positive" ? (
            <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#78cc8b] shadow-[0_0_0_2px_rgba(120,204,139,0.18)]" />
          ) : null}
          {helper}
        </p>
      )}
    </article>
  );
}
