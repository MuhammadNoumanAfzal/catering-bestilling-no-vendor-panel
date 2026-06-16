import { ChevronDown } from "lucide-react";

export default function SectionCard({
  title,
  actionLabel,
  actionVariant,
  actionOptions = [],
  activeActionOption,
  badgeCount,
  children,
  onActionClick,
  onActionOptionSelect,
  action,
}) {
  return (
    <section className="rounded-[10px] border border-[#e8e2da] bg-white px-[10px] pb-3 pt-2.5 shadow-[0_1px_2px_rgba(38,23,14,0.08),0_6px_14px_rgba(38,23,14,0.06)] max-[720px]:px-3 max-[720px]:pt-3">
      <div className="mb-3 flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-2">
        <div className="flex items-center gap-1.5">
          <h2 className="type-h3 m-0 text-[#1c1510]">{title}</h2>
          {badgeCount ? (
            <span className="type-subpara inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#d94032] px-[5px] text-[10px] text-white">
              {badgeCount}
            </span>
          ) : null}
        </div>
        {action ? action : actionLabel ? (
          actionVariant === "dropdown" ? (
            <div className="flex items-center gap-1.5 rounded-full border border-[#d9d1c9] bg-white px-2 py-[4px] shadow-[0_1px_2px_rgba(38,23,14,0.08)] max-[720px]:flex-wrap">
              {actionOptions.length > 0 ? (
                <>
                  {actionOptions.map((option) => {
                    const isActive = activeActionOption === option;

                    return (
                      <button
                        key={option}
                        className={`type-para cursor-pointer rounded-full px-2.5 py-[3px] transition ${
                          isActive
                            ? "bg-[#cf6e38] text-white"
                            : "text-[#201914]"
                        }`}
                        onClick={() => onActionOptionSelect?.(option)}
                        type="button"
                      >
                        {option}
                      </button>
                    );
                  })}
                  <ChevronDown className="text-[#7d7064]" size={12} strokeWidth={2.2} />
                </>
              ) : (
                <button
                  className="type-para inline-flex cursor-pointer items-center gap-1 rounded-full bg-white px-2.5 py-[3px] text-[#201914]"
                  onClick={onActionClick}
                  type="button"
                >
                  {actionLabel}
                  <ChevronDown size={12} strokeWidth={2.2} />
                </button>
              )}
            </div>
          ) : (
            <button
              className="type-para cursor-pointer border-0 bg-transparent p-0 text-[#3f78d4]"
              onClick={onActionClick}
              type="button"
            >
              {actionLabel}
            </button>
          )
        ) : null}
      </div>
      {children}
    </section>
  );
}
