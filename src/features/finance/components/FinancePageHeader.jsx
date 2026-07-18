import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const timeFilters = [
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisYear", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

export default function FinancePageHeader({
  customFrom,
  customTo,
  displayLabel,
  filter,
  onApplyCustomDate,
  onCustomFromChange,
  onCustomToChange,
  onFilterChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(id) {
    onFilterChange(id);
    if (id !== "custom") {
      setIsOpen(false);
    }
  }

  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="type-h2 m-0 text-[#15110f]">Finance &amp; Earnings</h1>
        <p className="type-para mt-1 text-[#746a62]">
          Track your income and financial performance.
        </p>
      </div>

      <div className="relative" ref={containerRef}>
        <button
          className="flex min-w-[140px] cursor-pointer items-center justify-between gap-1.5 rounded-[8px] border border-[#d9d1c9] bg-white px-3 py-2 text-[11px] font-semibold text-[#4f433a] transition hover:border-[#cf6e38]"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown
            className={`shrink-0 text-[#7d7064] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            size={12}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[280px] rounded-[14px] border border-[#ddd4cc] bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
            {timeFilters.map((filterOption) => {
              const isActive = filterOption.id === filter;

              return (
                <button
                  key={filterOption.id}
                  className={`mb-1 block w-full cursor-pointer rounded-[10px] px-3 py-2 text-left text-[11px] transition last:mb-0 ${
                    isActive
                      ? "bg-[#fff1eb] font-bold text-[#d96e39]"
                      : "text-[#40352f] hover:bg-[#faf5f1]"
                  }`}
                  onClick={() => handleSelect(filterOption.id)}
                  type="button"
                >
                  {filterOption.label}
                </button>
              );
            })}

            {filter === "custom" ? (
              <div className="mt-2 rounded-[12px] border border-[#f0dfd3] bg-[#fff8f4] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#d58a61]">
                  Custom Range
                </p>

                <div className="mt-3 grid gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9b7b66]">
                      From
                    </span>
                    <input
                      className="h-[40px] rounded-[10px] border border-[#dfcfc3] bg-white px-3 text-[12px] font-medium text-[#231b16] outline-none"
                      max={customTo || undefined}
                      onChange={(event) => onCustomFromChange(event.target.value)}
                      type="date"
                      value={customFrom}
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9b7b66]">
                      To
                    </span>
                    <input
                      className="h-[40px] rounded-[10px] border border-[#dfcfc3] bg-white px-3 text-[12px] font-medium text-[#231b16] outline-none"
                      min={customFrom || undefined}
                      onChange={(event) => onCustomToChange(event.target.value)}
                      type="date"
                      value={customTo}
                    />
                  </label>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    className="h-[38px] cursor-pointer rounded-full bg-[#d96e39] px-4 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!customFrom || !customTo || customFrom > customTo}
                    onClick={() => {
                      onApplyCustomDate();
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
