import { useTranslation } from "react-i18next";
import FinanceOrdersFilters from "../components/FinanceOrdersFilters";
import FinanceOverviewSection from "../components/FinanceOverviewSection";
import FinancePageHeader from "../components/FinancePageHeader";
import FinancePayoutsTable from "../components/FinancePayoutsTable";
import FinanceSummaryGrid from "../components/FinanceSummaryGrid";
import useFinancePageState from "../hooks/useFinancePageState";
import VendorPageLoadingState from "../../../components/shared/VendorPageLoadingState";

export default function FinancePage() {
  useTranslation();
  const {
    activeStatus,
    chartPoints,
    currentPage,
    customFrom,
    customTo,
    handleDateFilterChange,
    handlePageChange,
    handleRequestTransactionDetail,
    handleStatusChange,
    hasLoadedFinance,
    headerFilter,
    isLoading,

    pageSize,
    paginatedOrders,
    payoutStatuses,
    summaryCards,
    totalItems,
    totalPages,
    selectedDateOption,
  } = useFinancePageState();

  if (isLoading && !hasLoadedFinance) {
    return <VendorPageLoadingState />;
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <FinancePageHeader
        customFrom={customFrom}
        customTo={customTo}
        dateFilter={headerFilter}
        onDateFilterChange={handleDateFilterChange}
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
          onDateFilterChange={handleDateFilterChange}
          onStatusChange={handleStatusChange}
          selectedDateOption={selectedDateOption}
        />
      </div>

      <div className="mt-3">
        <FinancePayoutsTable
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
