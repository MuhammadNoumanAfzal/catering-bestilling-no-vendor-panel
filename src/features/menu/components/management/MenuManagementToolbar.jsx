import { ChevronDown } from "lucide-react";

export default function MenuManagementToolbar({
  activeTab,
  onSortChange,
  onTabChange,
  sortOptions,
  tabs,
  valueSort,
}) {
  return (
    <div className="mb-4 rounded-[12px] border border-[#ddd4cb] bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3 max-[920px]:flex-col max-[920px]:items-start">
        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`cursor-pointer rounded-[8px] px-3 py-[7px] text-[14px] font-bold transition ${
                activeTab === tab
                  ? "bg-[#d96e39] text-white"
                  : "text-[#2a211b]"
              }`}
              onClick={() => onTabChange(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            className="h-[36px] cursor-pointer appearance-none rounded-[18px] border border-[#d9d0c8] bg-white px-3 pr-8 text-[13px] font-semibold text-[#2a211b]"
            onChange={(event) => onSortChange(event.target.value)}
            value={valueSort}
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7b6d62]"
            size={14}
          />
        </div>
      </div>
    </div>
  );
}
