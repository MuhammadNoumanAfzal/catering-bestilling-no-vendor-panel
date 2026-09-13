import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Check, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const DEFAULT_OPTION = "Last 7 Days";
const CLEAR_OPTION = "All Time";
const options = [
  "All Time",
  "Last 7 Days",
  "Last Month",
  "Last 3 Months",
  "Last 6 Months",
  "This Year",
  "Custom Date",
];

export default function DateRangeDropdown({
  onChange,
  initialOption = DEFAULT_OPTION,
  initialStart = "",
  initialEnd = "",
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [activeOption, setActiveOption] = useState(initialOption);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [tempStart, setTempStart] = useState(initialStart);
  const [tempEnd, setTempEnd] = useState(initialEnd);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 640 : false));
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, maxHeight: 420 });

  const optionLabel = (option) => ({
    "All Time": t("dashboard.date.allTime", { defaultValue: "All time" }),
    "Last 7 Days": t("dashboard.date.last7"),
    "Last Month": t("dashboard.date.lastMonth", { defaultValue: "Last Month" }),
    "Last 3 Months": t("dashboard.date.last3Months", { defaultValue: "Last 3 Months" }),
    "Last 6 Months": t("dashboard.date.last6Months", { defaultValue: "Last 6 Months" }),
    "This Year": t("dashboard.date.thisYear", { defaultValue: "This Year" }),
    "Custom Date": t("dashboard.date.custom"),
  }[option] || option);

  useEffect(() => {
    setActiveOption(initialOption);
    setStartDate(initialStart || "");
    setEndDate(initialEnd || "");
    setTempStart(initialStart || "");
    setTempEnd(initialEnd || "");
  }, [initialEnd, initialOption, initialStart]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const position = () => {
      const anchor = dropdownRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const width = Math.min(256, window.innerWidth - 32);
      const height = menuRef.current?.offsetHeight || 404;
      const below = window.innerHeight - anchor.bottom - 22;
      const above = anchor.top - 22;
      const opensAbove = below < height && above > below;

      setMenuPosition({
        left: Math.max(16, Math.min(anchor.right - width, window.innerWidth - width - 16)),
        top: opensAbove ? Math.max(16, anchor.top - height - 6) : anchor.bottom + 6,
        maxHeight: Math.max(180, opensAbove ? above : below),
      });
    };

    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);

    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [isOpen, showCustomFields]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setIsOpen(false);
        setShowCustomFields(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowCustomFields(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function formatDateLabel(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function getDateRangeDisplay() {
    if (activeOption !== "Custom Date" || !startDate || !endDate) {
      return null;
    }

    return t("reviews.dateRange", {
      defaultValue: "From: {{from}} To: {{to}}",
      from: formatDateLabel(startDate),
      to: formatDateLabel(endDate),
    });
  }

  function handleOptionSelect(option) {
    if (option === "Custom Date") {
      setShowCustomFields(true);
      setTempStart(startDate || "");
      setTempEnd(endDate || "");
      return;
    }

    setActiveOption(option);
    setStartDate("");
    setEndDate("");
    setTempStart("");
    setTempEnd("");
    setIsOpen(false);
    setShowCustomFields(false);
    onChange?.(option, "", "");
  }

  function handleClear() {
    handleOptionSelect(CLEAR_OPTION);
  }

  function handleApply(event) {
    event.preventDefault();

    if (!tempStart || !tempEnd || tempStart > tempEnd) {
      return;
    }

    setActiveOption("Custom Date");
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setIsOpen(false);
    setShowCustomFields(false);
    onChange?.("Custom Date", tempStart, tempEnd);
  }

  const displayRange = getDateRangeDisplay();
  const triggerLabel = activeOption === "Custom Date" && startDate && endDate
    ? isMobile
      ? `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
      : optionLabel("Custom Date")
    : optionLabel(activeOption);

  return (
    <div className="relative inline-flex max-w-full items-center justify-end gap-2 select-none" ref={dropdownRef}>
      {displayRange && !isMobile ? (
        <button
          className="inline-flex max-w-[calc(100vw-8rem)] cursor-pointer items-center gap-1.5 rounded-[12px] border border-[#eadfd5] bg-white px-3 py-2 text-[12px] font-bold text-[#c75f2e] shadow-[0_8px_18px_rgba(45,28,16,0.05)] outline-none transition hover:border-[#e4c9b8] hover:bg-[#fff8f3] sm:max-w-none"
          onClick={() => {
            setIsOpen(true);
            setShowCustomFields(true);
          }}
          type="button"
        >
          <span className="truncate">{displayRange}</span>
          <ChevronDown size={14} className="shrink-0 text-[#9a8f86]" />
        </button>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label={t("dashboard.date.chooseRange", { defaultValue: "Filter by date" })}
        className="inline-flex h-10 max-w-full cursor-pointer items-center justify-between gap-2 rounded-[12px] border border-[#d8ccc2] bg-white px-3.5 text-[13px] font-bold text-[#2a211b] shadow-[0_8px_18px_rgba(45,28,16,0.04)] transition hover:border-[#cfb8a8] hover:bg-[#fbf8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Calendar size={15} className="shrink-0 text-[#c75f2e]" />
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown size={14} className={`shrink-0 text-[#8c8077] transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && createPortal(
        <div
          className="fixed z-[100] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[16px] border border-[#eadfd5] bg-white p-2 shadow-[0_18px_44px_rgba(45,28,16,0.14)]"
          ref={menuRef}
          style={menuPosition}
        >
          {!showCustomFields ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-2.5 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8c8077]">
                <Calendar size={13} className="text-[#c75f2e]" />
                {t("dashboard.date.chooseRange", { defaultValue: "Filter by date" })}
              </div>

              {options.map((option) => {
                const isActive = activeOption === option;
                return (
                  <button
                    aria-current={isActive ? "true" : undefined}
                    className={`flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 text-left text-[13px] font-semibold transition ${isActive ? "bg-[#fff3ec] text-[#c75f2e]" : "text-[#554940] hover:bg-[#faf6f2] hover:text-[#cf6e38]"}`}
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    type="button"
                  >
                    <span className="truncate">{optionLabel(option)}</span>
                    {isActive ? <Check size={14} className="shrink-0" /> : null}
                  </button>
                );
              })}

              <button
                className="mt-2 flex h-10 w-full cursor-pointer items-center justify-between gap-3 border-t border-[#f0e4da] px-3 pt-3 text-left text-[13px] font-semibold text-[#c75f2e] transition hover:bg-[#fff6ef]"
                onClick={handleClear}
                type="button"
              >
                <span className="truncate">{t("dashboard.date.clear", { defaultValue: "Clear Filter" })}</span>
              </button>
            </div>
          ) : (
            <form className="space-y-3 p-2" onSubmit={handleApply}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#1f1711]">
                  <Calendar size={13} className="text-[#c75f2e]" />
                  {t("dashboard.date.customRange")}
                </span>
                <button
                  className="cursor-pointer rounded-full p-1 text-[#9a8f86] hover:bg-[#f1e9e2] hover:text-[#1f1711]"
                  onClick={() => setShowCustomFields(false)}
                  type="button"
                >
                  <X size={14} aria-label={t("orders.cancel", { defaultValue: "Cancel" })} />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#6f655e]">{t("dashboard.date.from")}</label>
                  <input
                    aria-label={t("dashboard.date.from")}
                    className="h-10 w-full cursor-pointer rounded-[10px] border border-[#d8ccc2] bg-white px-3 py-1 text-[12px] font-semibold text-[#231913] outline-none transition focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
                    onChange={(event) => setTempStart(event.target.value)}
                    required
                    type="date"
                    value={tempStart}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#6f655e]">{t("dashboard.date.to")}</label>
                  <input
                    aria-label={t("dashboard.date.to")}
                    className="h-10 w-full cursor-pointer rounded-[10px] border border-[#d8ccc2] bg-white px-3 py-1 text-[12px] font-semibold text-[#231913] outline-none transition focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
                    onChange={(event) => setTempEnd(event.target.value)}
                    required
                    type="date"
                    value={tempEnd}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 cursor-pointer rounded-[10px] border border-[#d8ccc2] py-2 text-[11px] font-bold text-[#6f655e] transition hover:bg-[#faf9f8]"
                  onClick={() => setShowCustomFields(false)}
                  type="button"
                >
                  {t("dashboard.date.back", { defaultValue: "Back" })}
                </button>
                <button
                  className="flex-1 cursor-pointer rounded-[10px] bg-[#d96834] py-2 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(217,104,52,0.20)] transition hover:bg-[#b75424] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                  disabled={!tempStart || !tempEnd || tempStart > tempEnd}
                  type="submit"
                >
                  {t("dashboard.date.apply")}
                </button>
              </div>

              {tempStart && tempEnd && tempStart > tempEnd ? (
                <p className="text-[11px] font-medium text-[#d83f3f]">
                  {t("settings.invalidDateRange", { defaultValue: "End date must be the same as or after the start date." })}
                </p>
              ) : null}
            </form>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
