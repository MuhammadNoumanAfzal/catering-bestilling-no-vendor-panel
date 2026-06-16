import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function DateRangeDropdown({
  onChange,
  initialOption = "Last 7 Days",
  initialStart = "",
  initialEnd = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(initialOption);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = ["Last 2 Days", "Last 7 Days"];

  function handleOptionSelect(option) {
    if (option === "Custom Date") {
      setActiveOption("Custom Date");
    } else {
      setActiveOption(option);
      setIsOpen(false);
      onChange?.(option, "", "");
    }
  }

  function handleApply() {
    if (startDate && endDate) {
      setIsOpen(false);
      onChange?.("Custom Date", startDate, endDate);
    }
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-[#d9d0c8] bg-white px-4 text-[13px] font-bold text-[#2a211b] shadow-[0_1px_2px_rgba(38,23,14,0.06)] hover:bg-[#faf9f7] focus:outline-none"
        type="button"
      >
        <span>{activeOption}</span>
        {isOpen ? (
          <ChevronUp className="text-[#7d7064]" size={13} strokeWidth={2.4} />
        ) : (
          <ChevronDown className="text-[#7d7064]" size={13} strokeWidth={2.4} />
        )}
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[260px] rounded-[20px] border border-[#ddd4cb] bg-white p-3 shadow-[0_10px_30px_rgba(25,18,12,0.12)]">
          <div className="flex flex-col gap-1">
            {/* Standard Options */}
            {options.map((option) => {
              const isActive = activeOption === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full cursor-pointer rounded-[10px] px-4 py-2.5 text-left text-[14px] font-semibold transition ${
                    isActive
                      ? "bg-[#fffcfb] text-[#d96e39]"
                      : "text-[#2f2822] hover:bg-[#fcfaf7] hover:text-[#d96e39]"
                  }`}
                  type="button"
                >
                  {option}
                </button>
              );
            })}

            {/* Custom Date Option */}
            <div className="mt-1 flex flex-col">
              {activeOption === "Custom Date" ? (
                /* Custom Date Active Item */
                <div className="flex w-full items-center justify-between rounded-[10px] border border-[#d96e39] bg-[#fffcfb] px-4 py-2.5 text-[14px] font-semibold text-[#d96e39]">
                  <span>Custom Date</span>
                  <span className="text-[10px] font-extrabold tracking-wider text-[#d96e39]">ACTIVE</span>
                </div>
              ) : (
                /* Custom Date Inactive Item */
                <button
                  onClick={() => handleOptionSelect("Custom Date")}
                  className="w-full cursor-pointer rounded-[10px] px-4 py-2.5 text-left text-[14px] font-semibold text-[#2f2822] hover:bg-[#fcfaf7] hover:text-[#d96e39] transition"
                  type="button"
                >
                  Custom Date
                </button>
              )}

              {/* Custom Range Picker Panel */}
              {activeOption === "Custom Date" && (
                <div className="mt-2.5 flex flex-col rounded-[14px] border border-[#fceee7] bg-[#fffcfb] p-4 text-left">
                  <span className="text-[11px] font-bold tracking-wider text-[#d96e39] uppercase">
                    CUSTOM RANGE
                  </span>
                  <p className="mt-1 text-[12px] font-medium text-[#7d7064] leading-relaxed">
                    Choose a start and end date to filter the orders list.
                  </p>

                  {/* From Picker */}
                  <div className="mt-4 flex flex-col">
                    <label className="text-[11px] font-bold text-[#7b6d62] uppercase tracking-wide">
                      FROM
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1.5 h-[38px] w-full rounded-[10px] border border-[#d9d0c8] bg-white px-3 text-[13px] font-semibold text-[#2a211b] focus:border-[#cf6e38] focus:outline-none"
                    />
                  </div>

                  {/* To Picker */}
                  <div className="mt-3 flex flex-col">
                    <label className="text-[11px] font-bold text-[#7b6d62] uppercase tracking-wide">
                      TO
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1.5 h-[38px] w-full rounded-[10px] border border-[#d9d0c8] bg-white px-3 text-[13px] font-semibold text-[#2a211b] focus:border-[#cf6e38] focus:outline-none"
                    />
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={handleApply}
                    disabled={!startDate || !endDate}
                    className="mt-4 self-end rounded-full bg-[#d96e39] px-5 py-1.5 text-[12px] font-bold text-white shadow-[0_2px_4px_rgba(217,110,57,0.2)] hover:bg-[#c35c28] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
                    type="button"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
