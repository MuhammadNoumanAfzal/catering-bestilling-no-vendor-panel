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
    handleApplyHeaderCustomDate,
    handleApplyCustomDate,
    handleExport,
    handleHeaderFilterChange,
    handlePageChange,
    handleRequestTransactionDetail,
    handleSelectDateOption,
    handleStatusChange,
    handleToggleDateMenu,
    headerCustomFrom,
    headerCustomTo,
    headerFilter,
    headerFilterLabel,
    isExporting,
    isCustomDateOpen,
    isDateMenuOpen,
    isLoading,
    onCustomFromChange,
    onCustomToChange,
    onHeaderCustomFromChange,
    onHeaderCustomToChange,
    pageSize,
    paginatedOrders,
    payoutStatuses,
    summaryCards,
    totalItems,
    totalPages,
    selectedDateOption,
    handleClearDateFilter,
  } = useFinancePageState();

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <FinancePageHeader
        customFrom={headerCustomFrom}
        customTo={headerCustomTo}
        displayLabel={headerFilterLabel}
        filter={headerFilter}
        onApplyCustomDate={handleApplyHeaderCustomDate}
        onCustomFromChange={onHeaderCustomFromChange}
        onCustomToChange={onHeaderCustomToChange}
        onFilterChange={handleHeaderFilterChange}
      />

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
