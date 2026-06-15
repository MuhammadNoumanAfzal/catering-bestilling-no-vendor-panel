import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const timeFilters = [
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisYear", label: "This Year" },
];

export default function FinancePageHeader({ filter, onFilterChange }) {
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

  function handleSelect(label) {
    onFilterChange(label);
    setIsOpen(false);
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
          className="flex min-w-[110px] cursor-pointer items-center justify-between gap-1.5 rounded-[8px] border border-[#d9d1c9] bg-white px-3 py-2 text-[11px] font-semibold text-[#4f433a] transition hover:border-[#cf6e38]"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          <span>{filter}</span>
          <ChevronDown
            className={`shrink-0 text-[#7d7064] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            size={12}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[140px] rounded-[8px] border border-[#ddd4cc] bg-white py-1 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
            {timeFilters.map((filterOption) => {
              const isActive = filterOption.label === filter;

              return (
                <button
                  key={filterOption.id}
                  className={`block w-full cursor-pointer px-3 py-1.5 text-left text-[11px] transition ${
                    isActive
                      ? "bg-[#fff1eb] font-bold text-[#d96e39]"
                      : "text-[#40352f] hover:bg-[#faf5f1]"
                  }`}
                  onClick={() => handleSelect(filterOption.label)}
                  type="button"
                >
                  {filterOption.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
