import { ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";

const filterOptions = ["Last 7 Days", "Last 14 Days", "Last Month", "Custom Date"];

function formatCustomDate(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  return `${month}-${day}-${year}`;
}

export default function OrderTabs({
  tabs,
  activeTab,
  onTabChange,
  selectedFilter,
  onFilterSelect,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}) {
  const orderedTabs = [
    ...tabs.filter((tab) => tab.label === "All"),
    ...tabs.filter((tab) => tab.label !== "All"),
  ];
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const formattedRange = useMemo(() => {
    if (selectedFilter !== "Custom Date" || !fromDate || !toDate) {
      return "";
    }

    return `From: ${formatCustomDate(fromDate)}   To: ${formatCustomDate(toDate)}`;
  }, [fromDate, selectedFilter, toDate]);

  function handleFilterSelect(option) {
    onFilterSelect(option);
    if (option !== "Custom Date") {
      setIsFilterOpen(false);
    }
  }

  return (
    <div className="rounded-[10px] border border-[#ddd4cb] bg-white px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 max-[960px]:flex-col max-[960px]:items-start">
        <div
          className="flex flex-1 items-center gap-4 pr-1 max-[720px]:w-full max-[720px]:overflow-x-auto hide-scrollbar max-[720px]:gap-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {orderedTabs.map((tab) => (
            <button
              key={tab.label}
              className={[
                "type-h5 cursor-pointer inline-flex shrink-0 items-center justify-center rounded-[7px] border-0 px-3 py-[6px] text-[14px] font-semibold leading-[1.2]",
                activeTab === tab.label
                  ? "bg-[#cf6e38] text-white"
                  : "bg-transparent text-[#1f1914]",
              ].join(" ")}
              onClick={() => onTabChange(tab.label)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 max-[720px]:w-full max-[720px]:flex-wrap">
          {formattedRange ? (
            <div className="type-subpara flex items-center gap-1.5 rounded-full bg-[#ffd8c9] px-4 py-[7px] text-[#c56e4b]">
              <span>{formattedRange}</span>
              <button
                className="inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 hover:bg-[#ffc8b3] text-[#c56e4b] hover:text-[#9c4d2d] transition-colors border-0 bg-transparent"
                onClick={() => onFilterSelect("")}
                type="button"
              >
                <X size={12} />
              </button>
            </div>
          ) : null}

          <div className="relative">
            <button
              className="type-para inline-flex min-h-[32px] cursor-pointer shrink-0 items-center justify-center gap-1 rounded-full border border-[#d8cfc6] bg-white px-4 font-medium text-[#2d261f]"
              onClick={() => setIsFilterOpen((currentState) => !currentState)}
              type="button"
            >
              {selectedFilter || "Filter Date"}
              {selectedFilter ? (
                <span
                  className="ml-1.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-[#f3ece6] text-[#746a62] hover:text-[#17120e] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterSelect("");
                  }}
                >
                  <X size={14} />
                </span>
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {isFilterOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[150px] rounded-[6px] border border-[#ddd4cb] bg-white p-1 shadow-[0_10px_24px_rgba(25,18,12,0.16)]">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    className={`block w-full cursor-pointer rounded-[4px] px-2 py-1.5 text-left text-[10px] font-medium transition ${
                      selectedFilter === option
                        ? "bg-[#f7efe8] text-[#cf6e38]"
                        : "text-[#5e554d] hover:bg-[#f6f1eb]"
                    }`}
                    onClick={() => handleFilterSelect(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}

                {selectedFilter === "Custom Date" ? (
                  <div className="mt-1 border-t border-[#ece3d9] px-1 pt-2">
                    <label className="mb-1 block text-[10px] font-medium text-[#6f645b]">
                      From
                    </label>
                    <input
                      className="mb-2 h-8 w-full cursor-pointer rounded-[6px] border border-[#d8cfc6] bg-white px-2 text-[11px] text-[#2d261f] outline-none"
                      onChange={(event) => onFromDateChange(event.target.value)}
                      type="date"
                      value={fromDate}
                    />
                    <label className="mb-1 block text-[10px] font-medium text-[#6f645b]">
                      To
                    </label>
                    <input
                      className="h-8 w-full cursor-pointer rounded-[6px] border border-[#d8cfc6] bg-white px-2 text-[11px] text-[#2d261f] outline-none"
                      onChange={(event) => onToDateChange(event.target.value)}
                      type="date"
                      value={toDate}
                    />
                    <button
                      className="mt-2 inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-[6px] bg-[#cf6e38] px-3 text-[11px] font-semibold text-white"
                      onClick={() => setIsFilterOpen(false)}
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
