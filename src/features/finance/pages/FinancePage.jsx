import FinanceFooter from "../components/FinanceFooter";
import FinanceOrdersFilters from "../components/FinanceOrdersFilters";
import FinanceOrdersTable from "../components/FinanceOrdersTable";
import FinanceOverviewSection from "../components/FinanceOverviewSection";
import FinancePageHeader from "../components/FinancePageHeader";
import FinanceSummaryGrid from "../components/FinanceSummaryGrid";
import {
  earningsPoints,
  financeSummaryCards,
  payoutStatuses,
} from "../data/financeData";
import useFinancePageState from "../hooks/useFinancePageState";

export default function FinancePage() {
  const {
    activeStatus,
    currentPage,
    customFrom,
    customTo,
    dateButtonLabel,
    filteredOrders,
    handleApplyCustomDate,
    handlePageChange,
    handleSelectDateOption,
    handleStatusChange,
    handleToggleDateMenu,
    isCustomDateOpen,
    isDateMenuOpen,
    onCustomFromChange,
    onCustomToChange,
    pageSize,
    paginatedOrders,
    totalPages,
  } = useFinancePageState();

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <FinancePageHeader />

      <FinanceSummaryGrid cards={financeSummaryCards} />

      <FinanceOverviewSection
        earningsPoints={earningsPoints}
        payoutStatuses={payoutStatuses}
      />

      <div className="mt-4">
        <FinanceOrdersFilters
          activeStatus={activeStatus}
          customFrom={customFrom}
          customTo={customTo}
          dateButtonLabel={dateButtonLabel}
          isCustomDateOpen={isCustomDateOpen}
          isDateMenuOpen={isDateMenuOpen}
          onApplyCustomDate={handleApplyCustomDate}
          onCustomFromChange={onCustomFromChange}
          onCustomToChange={onCustomToChange}
          onSelectDateOption={handleSelectDateOption}
          onStatusChange={handleStatusChange}
          onToggleDateMenu={handleToggleDateMenu}
        />
      </div>

      <div className="mt-3">
        <FinanceOrdersTable
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          rows={paginatedOrders}
          totalItems={filteredOrders.length}
          totalPages={totalPages}
        />
      </div>

      <FinanceFooter />
    </section>
  );
}
