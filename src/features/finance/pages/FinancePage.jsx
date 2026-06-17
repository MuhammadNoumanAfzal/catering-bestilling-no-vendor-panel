import { useMemo, useState } from "react";
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
  const [headerFilter, setHeaderFilter] = useState("Last 7 days");
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

  const dynamicSummaryCards = useMemo(() => {
    if (headerFilter === "Last 30 days") {
      return [
        { label: "Total Earnings", value: "kr 48,930.00", accent: "#ffefe7", icon: "camera" },
        { label: "Net Income", value: "kr 44,037.00", accent: "#fff2ec", icon: "wallet" },
        { label: "Platform Commission", value: "kr 4,893.00", accent: "#fff2ec", icon: "close" },
        { label: "Pending Payouts", value: "kr 2,150.00", accent: "#fff2ec", icon: "clock" },
      ];
    }
    if (headerFilter === "This Month") {
      return [
        { label: "Total Earnings", value: "kr 8,340.00", accent: "#ffefe7", icon: "camera" },
        { label: "Net Income", value: "kr 7,506.00", accent: "#fff2ec", icon: "wallet" },
        { label: "Platform Commission", value: "kr 834.00", accent: "#fff2ec", icon: "close" },
        { label: "Pending Payouts", value: "kr 450.00", accent: "#fff2ec", icon: "clock" },
      ];
    }
    if (headerFilter === "Last Month") {
      return [
        { label: "Total Earnings", value: "kr 38,120.00", accent: "#ffefe7", icon: "camera" },
        { label: "Net Income", value: "kr 34,308.00", accent: "#fff2ec", icon: "wallet" },
        { label: "Platform Commission", value: "kr 3,812.00", accent: "#fff2ec", icon: "close" },
        { label: "Pending Payouts", value: "kr 0.00", accent: "#fff2ec", icon: "clock" },
      ];
    }
    if (headerFilter === "This Year") {
      return [
        { label: "Total Earnings", value: "kr 184,200.00", accent: "#ffefe7", icon: "camera" },
        { label: "Net Income", value: "kr 165,780.00", accent: "#fff2ec", icon: "wallet" },
        { label: "Platform Commission", value: "kr 18,420.00", accent: "#fff2ec", icon: "close" },
        { label: "Pending Payouts", value: "kr 1,284.10", accent: "#fff2ec", icon: "clock" },
      ];
    }
    return financeSummaryCards;
  }, [headerFilter]);

  const dynamicChartPoints = useMemo(() => {
    if (headerFilter === "Last 30 days") {
      return [200, 310, 450, 400, 560, 680, 510, 720, 890, 940, 1100, 1250];
    }
    if (headerFilter === "This Month") {
      return [100, 180, 250, 210, 320, 410, 390, 450, 520, 600, 580, 710];
    }
    if (headerFilter === "Last Month") {
      return [150, 280, 310, 420, 390, 480, 520, 610, 580, 690, 720, 810];
    }
    if (headerFilter === "This Year") {
      return [1200, 2100, 3500, 4800, 6200, 7500, 9100, 10800, 12400, 14200, 16100, 18400];
    }
    return earningsPoints;
  }, [headerFilter]);

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <FinancePageHeader filter={headerFilter} onFilterChange={setHeaderFilter} />

      <FinanceSummaryGrid cards={dynamicSummaryCards} />

      <FinanceOverviewSection
        earningsPoints={dynamicChartPoints}
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
    </section>
  );
}
