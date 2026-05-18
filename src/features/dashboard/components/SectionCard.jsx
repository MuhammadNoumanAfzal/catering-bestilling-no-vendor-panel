import { ChevronDown } from "lucide-react";

export default function SectionCard({
  title,
  actionLabel,
  actionVariant,
  badgeCount,
  children,
}) {
  return (
    <section className="rounded-[10px] border border-[#e8e2da] bg-white px-[10px] pb-3 pt-2.5 shadow-[0_1px_2px_rgba(38,23,14,0.08),0_6px_14px_rgba(38,23,14,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h2 className="type-h3 m-0 text-[#1c1510]">{title}</h2>
          {badgeCount ? (
            <span className="type-subpara inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#d94032] px-[5px] text-[10px] text-white">
              {badgeCount}
            </span>
          ) : null}
        </div>
        {actionLabel ? (
          <button
            className={`type-para ${actionVariant === "dropdown" ? "inline-flex items-center gap-1 rounded-full border border-[#d9d1c9] bg-white px-2.5 py-[5px] text-[#201914] shadow-[0_1px_2px_rgba(38,23,14,0.08)]" : "border-0 bg-transparent p-0 text-[#3f78d4]"}`}
            type="button"
          >
            {actionLabel}
            {actionVariant === "dropdown" ? <ChevronDown size={12} strokeWidth={2.2} /> : null}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
