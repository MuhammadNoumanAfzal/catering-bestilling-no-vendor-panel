import { ChevronDown, ChevronUp, X } from "lucide-react";

const dateOptions = [
  { id: "lastMonth", label: "Last Month" },
  { id: "last3Months", label: "Last 3 Months" },
  { id: "last6Months", label: "Last 6 Months" },
  { id: "thisYear", label: "This Year" },
  { id: "custom", label: "Custom Date" },
];

export default function ReviewsFiltersBar({
  activeFilter,
  customFrom,
  customTo,
  dateButtonLabel,
  filters,
  isCustomDateOpen,
  isDateMenuOpen,
  onApplyCustomDate,
  onClearFilters,
  onCustomFromChange,
  onCustomToChange,
  onFilterChange,
  onSelectDateOption,
  onToggleDateMenu,
  selectedDateOption,
}) {
  return (
    <div className="rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-2.5 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
        <div className="flex min-w-0 flex-wrap items-center gap-2 max-[480px]:grid max-[480px]:grid-cols-3">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`cursor-pointer min-w-[34px] rounded-[8px] px-3 py-[7px] text-[11px] font-bold transition ${
                activeFilter === filter
                  ? "bg-[#de6f39] text-white"
                  : "border border-[#ded6cf] bg-white text-[#6f645b] hover:text-[#de6f39]"
              } max-[480px]:min-w-0 max-[480px]:w-full`}
              onClick={() => onFilterChange(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 items-center gap-2 max-[760px]:w-full max-[760px]:flex-col max-[760px]:items-stretch">
          <div className="relative min-w-0 max-[760px]:w-full">
            <button
              className="flex min-w-[108px] max-w-[320px] cursor-pointer items-center justify-between gap-2 rounded-full border border-[#d7cfc7] bg-white px-4 py-[7px] text-[12px] font-semibold text-[#231b16] max-[760px]:w-full max-[760px]:max-w-none"
              onClick={onToggleDateMenu}
              type="button"
            >
              <span className="min-w-0 truncate">{dateButtonLabel}</span>
              {selectedDateOption !== "lastMonth" ? (
                <span
                  className="ml-1 inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-[#746a62] transition-colors hover:bg-[#f3ece6] hover:text-[#17120e]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDateOption("lastMonth");
                  }}
                >
                  <X size={12} />
                </span>
              ) : isDateMenuOpen ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {isDateMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[320px] max-w-[calc(100vw-40px)] rounded-[20px] border border-[#eadcd1] bg-white p-3 shadow-[0_18px_40px_rgba(0,0,0,0.14)] max-[760px]:left-0 max-[760px]:right-auto max-[760px]:w-full max-[760px]:max-w-none">
                <div className="space-y-1">
                  {dateOptions.map((option) => {
                    const isActive = option.id === "custom" && isCustomDateOpen;

                    return (
                      <button
                        key={option.id}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[12px] font-medium transition ${
                          isActive
                            ? "border border-[#1f1814] bg-[#fff3ec] text-[#d96e39]"
                            : "border border-transparent text-[#3b2f29] hover:bg-[#fff1ea] hover:text-[#d96e39]"
                        }`}
                        onClick={() => onSelectDateOption(option.id)}
                        type="button"
                      >
                        <span>{option.label}</span>
                        {isActive ? (
                          <span className="text-[10px] font-bold tracking-[0.08em]">
                            ACTIVE
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {isCustomDateOpen ? (
                  <div className="mt-3 rounded-[18px] border border-[#f0dfd3] bg-[#fff8f4] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#d58a61]">
                      Custom Range
                    </p>
                    <p className="mt-2 text-[12px] leading-[1.5] text-[#7f7369]">
                      Choose a start and end date to filter the reviews list.
                    </p>

                    <div className="mt-4 space-y-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9b7b66]">
                          From
                        </span>
                        <input
                          className="h-[44px] cursor-pointer rounded-[14px] border border-[#dfcfc3] bg-white px-3 text-[12px] font-medium text-[#231b16] outline-none"
                          onChange={(event) => onCustomFromChange(event.target.value)}
                          type="date"
                          value={customFrom}
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9b7b66]">
                          To
                        </span>
                        <input
                          className="h-[44px] cursor-pointer rounded-[14px] border border-[#dfcfc3] bg-white px-3 text-[12px] font-medium text-[#231b16] outline-none"
                          onChange={(event) => onCustomToChange(event.target.value)}
                          type="date"
                          value={customTo}
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        className="h-[40px] cursor-pointer rounded-full bg-[#d96e39] px-5 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!customFrom || !customTo}
                        onClick={onApplyCustomDate}
                        type="button"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            className="cursor-pointer rounded-[8px] border border-[#dcd4cc] bg-white px-3 py-[7px] text-[10px] font-bold text-[#2b231d] max-[760px]:w-full"
            onClick={onClearFilters}
            type="button"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
