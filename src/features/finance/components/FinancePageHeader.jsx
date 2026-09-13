import { translateFinanceText } from "../financeTranslations";
import DateRangeDropdown from "../../dashboard/components/DateRangeDropdown";

export default function FinancePageHeader({
  dateFilter,
  customFrom,
  customTo,
  onDateFilterChange,
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3 max-[720px]:flex-col">
      <div>
        <h1 className="type-h2 m-0 text-[#15110f]"> {translateFinanceText("Finance & Earnings")} </h1>
        <p className="type-para mt-1 text-[#746a62]"> {translateFinanceText("Track your income and financial performance.")} </p>
      </div>

      <DateRangeDropdown
        initialEnd={customTo}
        initialOption={dateFilter}
        initialStart={customFrom}
        onChange={onDateFilterChange}
      />
    </header>
  );
}