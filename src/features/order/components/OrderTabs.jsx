import { ChevronDown } from "lucide-react";

export default function OrderTabs({ tabs, activeTab, sortOption, onTabChange, onSortToggle }) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 pb-[14px] pt-0.5 max-[960px]:flex-col max-[960px]:items-start">
      <div className="flex items-center gap-[22px] max-[720px]:flex-wrap max-[720px]:gap-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={[
              "type-para border-0 bg-transparent p-0 text-[14px] font-bold leading-[1.2] text-[#2d261f]",
              activeTab === tab.label
                ? "inline-flex min-h-8 min-w-10 items-center justify-center rounded-full bg-[#cf6e38] px-4 text-white"
                : "",
            ].join(" ")}
            onClick={() => onTabChange(tab.label)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        className="type-para inline-flex min-h-9 min-w-[88px] items-center justify-center gap-1 rounded-full border border-[#dad1c8] bg-white px-3 text-[14px] font-bold text-[#2d261f]"
        onClick={onSortToggle}
        type="button"
      >
        {sortOption}
        <ChevronDown size={14} />
      </button>
    </div>
  );
}
