import FinanceOrdersFilters from "../components/FinanceOrdersFilters";
import FinanceOrdersTable from "../components/FinanceOrdersTable";
import FinanceOverviewSection from "../components/FinanceOverviewSection";
import FinancePageHeader from "../components/FinancePageHeader";
import FinanceSummaryGrid from "../components/FinanceSummaryGrid";
import useFinancePageState from "../hooks/useFinancePageState";

export default function FinancePage() {
  const {
    activeStatus,
    chartPoints,
    currentPage,
    customFrom,
    customTo,
    dateButtonLabel,
    handleApplyCustomDate,
    handleExport,
    handlePageChange,
    handleRequestTransactionDetail,
    handleSelectDateOption,
    handleStatusChange,
    handleToggleDateMenu,
    headerFilter,
    isExporting,
    isCustomDateOpen,
    isDateMenuOpen,
    isLoading,
    onCustomFromChange,
    onCustomToChange,
    pageSize,
    paginatedOrders,
    payoutStatuses,
    setHeaderFilter,
    summaryCards,
    totalItems,
    totalPages,
    selectedDateOption,
    handleClearDateFilter,
  } = useFinancePageState();

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <FinancePageHeader filter={headerFilter} onFilterChange={setHeaderFilter} />

      <FinanceSummaryGrid cards={summaryCards} />

      <FinanceOverviewSection
        earningsPoints={chartPoints}
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
          selectedDateOption={selectedDateOption}
          onClearDateFilter={handleClearDateFilter}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>

      <div className="mt-3">
        <FinanceOrdersTable
          currentPage={currentPage}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onRequestDetail={handleRequestTransactionDetail}
          pageSize={pageSize}
          rows={paginatedOrders}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      </div>
    </section>
  );
}
