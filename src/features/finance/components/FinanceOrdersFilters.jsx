import { translateFinanceText } from "../financeTranslations";
import { financeStatusTabs } from "../data/financeFilterOptions";
import DateRangeDropdown from "../../dashboard/components/DateRangeDropdown";

export default function FinanceOrdersFilters({
  activeStatus,
  customFrom,
  customTo,
  onDateFilterChange,
  onStatusChange,
  selectedDateOption,
}) {
  return (
    <div className="rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-2.5 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
        <div className="flex items-center gap-5 max-[760px]:overflow-x-auto">
          {financeStatusTabs.map((status) => {
            const isActive = activeStatus === status;

            return (
              <button
                key={translateFinanceText(status)}
                className={`cursor-pointer rounded-[6px] px-3 py-1.5 text-[12px] font-bold leading-none transition ${
                  isActive
                    ? "bg-[#d96e39] text-white"
                    : "text-[#231b16] hover:text-[#d96e39]"
                }`}
                onClick={() => onStatusChange(status)}
                type="button"
              >
                {translateFinanceText(status)}
              </button>
            );
          })}
        </div>

        <DateRangeDropdown
          initialEnd={customTo}
          initialOption={selectedDateOption}
          initialStart={customFrom}
          onChange={onDateFilterChange}
        />
      </div>
    </div>
  );
}