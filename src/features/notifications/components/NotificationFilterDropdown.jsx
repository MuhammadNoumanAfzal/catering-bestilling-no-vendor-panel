import { CalendarDays, ChevronDown, X } from "lucide-react";

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const [year, month, day] = dateValue.split("-");
  return `${day}-${month}-${year}`;
}

export default function NotificationFilterDropdown({
  customRange,
  filterLabel,
  isOpen,
  onCustomRangeChange,
  onSelectFilter,
  onToggle,
  options,
  selectedFilter,
  setIsOpen,
}) {
  const isCustom = selectedFilter === "Custom Date";

  return (
    <div className="relative min-w-0 max-[760px]:w-full">
      <button
        className="type-subpara inline-flex min-h-[38px] min-w-0 items-center gap-2 rounded-full border border-[#f1beab] bg-[#ffe0d1] px-4 text-[#d86f39] max-[760px]:flex max-[760px]:w-full max-[760px]:justify-between"
        onClick={onToggle}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarDays size={14} />
          <span className="truncate">{filterLabel}</span>
        </span>
        {selectedFilter !== "Last Month" ? (
          <span
            className="ml-1 inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-[#d86f39] transition-colors hover:bg-[#ffd0bb] hover:text-[#9e3f14]"
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter("Last Month");
            }}
          >
            <X size={12} />
          </span>
        ) : (
          <ChevronDown size={14} />
        )}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 min-w-[236px] max-w-[min(92vw,320px)] rounded-[12px] border border-[#eadfd6] bg-white p-2 shadow-[0_20px_45px_rgba(28,18,12,0.18)] max-[760px]:left-0 max-[760px]:right-auto max-[760px]:w-full max-[760px]:min-w-0 max-[760px]:max-w-none">
          <div className="flex flex-col gap-1">
            {options.map((option) => {
              const isSelected = selectedFilter === option;

              return (
                <button
                  key={option}
                  className={`type-subpara rounded-[8px] px-3 py-[7px] text-left transition ${
                    isSelected
                      ? "bg-[#ffe0d1] text-[#d86f39]"
                      : "text-[#5f5349] hover:bg-[#f7f1eb]"
                  }`}
                  onClick={() => onSelectFilter(option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isCustom ? (
            <div className="mt-3 rounded-[10px] bg-[#fff5ef] p-3">
              <div className="grid gap-2">
                <label className="flex flex-col gap-1">
                  <span className="type-subpara text-[#7f7064]">From</span>
                  <input
                    className="type-subpara h-[36px] rounded-[8px] border border-[#efc3af] bg-white px-3 text-[#1f1813] outline-none focus:border-[#d86f39]"
                    onChange={(event) =>
                      onCustomRangeChange("from", event.target.value)
                    }
                    type="date"
                    value={customRange.from}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="type-subpara text-[#7f7064]">To</span>
                  <input
                    className="type-subpara h-[36px] rounded-[8px] border border-[#efc3af] bg-white px-3 text-[#1f1813] outline-none focus:border-[#d86f39]"
                    onChange={(event) =>
                      onCustomRangeChange("to", event.target.value)
                    }
                    type="date"
                    value={customRange.to}
                  />
                </label>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  className="type-subpara rounded-[7px] border border-[#d9cec5] bg-white px-3 py-[6px] text-[#524740]"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Apply
                </button>
              </div>
            </div>
          ) : null}

          <p className="type-subpara mt-3 break-words text-[#998b80]">
            {isCustom
              ? `From: ${formatDateLabel(customRange.from)}   To: ${formatDateLabel(customRange.to)}`
              : "Choose a date range to filter notifications."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
