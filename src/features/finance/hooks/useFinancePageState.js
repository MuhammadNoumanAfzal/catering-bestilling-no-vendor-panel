import { useEffect, useMemo, useState } from "react";
import {
  exportVendorFinanceTransactions,
  getVendorFinanceOverviewChart,
  getVendorFinanceSummary,
  getVendorPayouts,
} from "../api/financeApi";
import {
  getChartGroupBy,
  getFinanceDateRangeVariables,
  getFinanceSummaryVariables,
  mapFinanceChartPoints,
  mapFinanceSummaryCards,
  mapPayoutStatusItems,
  mapPayoutTransactions,
} from "../api/financeMappers";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const PAGE_SIZE = 10;
const VENDOR_FINANCE_NOTIFICATION_EVENT = "vendor-finance-notification-received";
const FINANCE_SUMMARY_ERROR_MESSAGE =
  "Unable to load finance summary right now. Please try again shortly.";
const FINANCE_TRANSACTIONS_ERROR_MESSAGE =
  "Unable to load payout activity right now. Please try again shortly.";

function getSafeFinanceErrorMessage(error, fallbackMessage) {
  const message = String(error?.message || "").trim();

  if (!message) {
    return fallbackMessage;
  }

  const looksLikeServerTrace =
    message.includes("/home/") ||
    message.includes("Traceback") ||
    message.includes("cannot import name") ||
    message.includes("graphql_relay") ||
    message.includes("\n");

  return looksLikeServerTrace ? fallbackMessage : message;
}

function toPayoutStatusFilter(status) {
  if (!status || status === "All") {
    return undefined;
  }

  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  return normalized === "RELEASED" ? "PAYOUT_RELEASED" : normalized;
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export default function useFinancePageState() {
  const [currentPage, setCurrentPage] = useState(1);
  const [headerFilter, setHeaderFilter] = useState("7days");
  const [headerCustomFrom, setHeaderCustomFrom] = useState("");
  const [headerCustomTo, setHeaderCustomTo] = useState("");
  const [appliedHeaderCustomRange, setAppliedHeaderCustomRange] = useState(null);
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedDateOption, setSelectedDateOption] = useState("30days");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);
  const [summaryCards, setSummaryCards] = useState([]);
  const [chartPoints, setChartPoints] = useState([]);
  const [payoutStatuses, setPayoutStatuses] = useState([]);
  const [payoutRows, setPayoutRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const headerRangeVariables = useMemo(
    () =>
      getFinanceSummaryVariables({
        rangePreset: headerFilter,
        customFrom: appliedHeaderCustomRange?.from,
        customTo: appliedHeaderCustomRange?.to,
      }),
    [appliedHeaderCustomRange?.from, appliedHeaderCustomRange?.to, headerFilter],
  );

  const payoutTableRangeVariables = useMemo(
    () =>
      getFinanceDateRangeVariables({
        rangePreset: selectedDateOption,
        customFrom: appliedCustomRange?.from,
        customTo: appliedCustomRange?.to,
      }),
    [appliedCustomRange?.from, appliedCustomRange?.to, selectedDateOption],
  );

  const payoutSummaryRangeVariables = useMemo(
    () =>
      getFinanceDateRangeVariables({
        rangePreset: headerFilter,
        customFrom: appliedHeaderCustomRange?.from,
        customTo: appliedHeaderCustomRange?.to,
      }),
    [appliedHeaderCustomRange?.from, appliedHeaderCustomRange?.to, headerFilter],
  );

  const payoutQueryVariables = useMemo(
    () => ({
      ...(toPayoutStatusFilter(activeStatus)
        ? { status: toPayoutStatusFilter(activeStatus) }
        : {}),
      ...payoutTableRangeVariables,
    }),
    [activeStatus, payoutTableRangeVariables],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadHeaderData() {
      try {
        const [summaryResult, chartResult, payoutResult] = await Promise.allSettled([
          getVendorFinanceSummary(headerRangeVariables),
          getVendorFinanceOverviewChart({
            ...headerRangeVariables,
            groupBy: getChartGroupBy(
              headerFilter,
              appliedHeaderCustomRange?.from,
              appliedHeaderCustomRange?.to,
            ),
          }),
          getVendorPayouts({ first: 100, ...payoutSummaryRangeVariables }),
        ]);

        if (isCancelled) {
          return;
        }

        if (summaryResult.status !== "fulfilled" || chartResult.status !== "fulfilled") {
          const summaryError =
            summaryResult.status === "rejected" ? summaryResult.reason : null;
          const chartError =
            chartResult.status === "rejected" ? chartResult.reason : null;

          throw (
            summaryError ||
            chartError ||
            new Error(FINANCE_SUMMARY_ERROR_MESSAGE)
          );
        }

        const payoutPayload =
          payoutResult.status === "fulfilled" ? payoutResult.value : null;

        setSummaryCards(mapFinanceSummaryCards(summaryResult.value, payoutPayload));
        setChartPoints(mapFinanceChartPoints(chartResult.value));
        setPayoutStatuses(
          payoutPayload ? mapPayoutStatusItems(payoutPayload) : [],
        );
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            getSafeFinanceErrorMessage(error, FINANCE_SUMMARY_ERROR_MESSAGE),
            "Finance unavailable",
          );
        }
      }
    }

    loadHeaderData();

    return () => {
      isCancelled = true;
    };
  }, [
    appliedHeaderCustomRange?.from,
    appliedHeaderCustomRange?.to,
    headerFilter,
    headerRangeVariables,
    payoutSummaryRangeVariables,
    refreshTick,
  ]);

  useEffect(() => {
    function handleFinanceNotificationRefresh() {
      setRefreshTick((current) => current + 1);
      setCurrentPage(1);
    }

    window.addEventListener(
      VENDOR_FINANCE_NOTIFICATION_EVENT,
      handleFinanceNotificationRefresh,
    );

    return () => {
      window.removeEventListener(
        VENDOR_FINANCE_NOTIFICATION_EVENT,
        handleFinanceNotificationRefresh,
      );
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [payoutQueryVariables]);

  useEffect(() => {
    let isCancelled = false;

    async function loadPayoutActivity() {
      setIsLoading(true);

      try {
        const result = await getVendorPayouts({
          first: 100,
          ...payoutQueryVariables,
        });

        if (isCancelled) {
          return;
        }

        const mapped = mapPayoutTransactions(result);
        setPayoutRows(mapped.rows);
      } catch (error) {
        if (!isCancelled) {
          setPayoutRows([]);
          await showVendorErrorAlert(
            getSafeFinanceErrorMessage(
              error,
              FINANCE_TRANSACTIONS_ERROR_MESSAGE,
            ),
            "Payout activity unavailable",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPayoutActivity();

    return () => {
      isCancelled = true;
    };
  }, [payoutQueryVariables, refreshTick]);

  const totalItems = payoutRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedOrders = payoutRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const dateButtonLabel =
    selectedDateOption === "custom" &&
    appliedCustomRange?.from &&
    appliedCustomRange?.to
      ? `From: ${formatDateLabel(appliedCustomRange.from)} To: ${formatDateLabel(appliedCustomRange.to)}`
      : selectedDateOption === "30days"
        ? "Last 30 Days"
        : selectedDateOption === "lastMonth"
          ? "Last Month"
          : selectedDateOption === "thisMonth"
            ? "This Month"
            : selectedDateOption === "thisYear"
              ? "This Year"
              : selectedDateOption === "custom"
                ? "Custom Date"
                : "Last 30 Days";

  const headerFilterLabel =
    headerFilter === "custom" &&
    appliedHeaderCustomRange?.from &&
    appliedHeaderCustomRange?.to
      ? `${formatDateLabel(appliedHeaderCustomRange.from)} - ${formatDateLabel(appliedHeaderCustomRange.to)}`
      : headerFilter === "7days"
        ? "Last 7 days"
        : headerFilter === "30days"
          ? "Last 30 days"
          : headerFilter === "thisMonth"
            ? "This Month"
            : headerFilter === "lastMonth"
              ? "Last Month"
              : headerFilter === "thisYear"
                ? "This Year"
                : headerFilter === "custom"
                  ? "Custom Range"
                  : "Last 7 days";

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);
  }

  function handleStatusChange(nextStatus) {
    setActiveStatus(nextStatus);
  }

  function handleHeaderFilterChange(nextFilter) {
    setHeaderFilter(nextFilter);

    if (nextFilter !== "custom") {
      setAppliedHeaderCustomRange(null);
      setHeaderCustomFrom("");
      setHeaderCustomTo("");
    }
  }

  function handleApplyHeaderCustomDate() {
    if (!headerCustomFrom || !headerCustomTo || headerCustomFrom > headerCustomTo) {
      return;
    }

    setAppliedHeaderCustomRange({
      from: headerCustomFrom,
      to: headerCustomTo,
    });
    setHeaderFilter("custom");
  }

  function handleToggleDateMenu() {
    setIsDateMenuOpen((current) => !current);
  }

  function handleSelectDateOption(optionId) {
    setSelectedDateOption(optionId);

    if (optionId === "custom") {
      setIsCustomDateOpen(true);
      setIsDateMenuOpen(true);
      return;
    }

    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);
    setAppliedCustomRange(null);
  }

  function handleApplyCustomDate() {
    if (!customFrom || !customTo) {
      return;
    }

    setAppliedCustomRange({
      from: customFrom,
      to: customTo,
    });
    setSelectedDateOption("custom");
    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);
  }

  async function handleRequestTransactionDetail(id) {
    return payoutRows.find((row) => row.id === id) || null;
  }

  async function handleExport(format) {
    try {
      setIsExporting(true);
      const result = await exportVendorFinanceTransactions({
        ...(toPayoutStatusFilter(activeStatus)
          ? { status: toPayoutStatusFilter(activeStatus) }
          : {}),
        ...payoutTableRangeVariables,
        format,
      });

      if (result.downloadUrl && typeof window !== "undefined") {
        window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      }

      await showVendorSuccessToast(result.message || "Export generated successfully.");
    } catch (error) {
      await showVendorErrorAlert(
        getSafeFinanceErrorMessage(
          error,
          "Unable to export payout activity right now. Please try again shortly.",
        ),
        "Export failed",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return {
    activeStatus,
    chartPoints,
    currentPage,
    customFrom,
    customTo,
    dateButtonLabel,
    handleApplyHeaderCustomDate,
    handleApplyCustomDate,
    handleClearDateFilter: () => {
      setSelectedDateOption("30days");
      setAppliedCustomRange(null);
      setCustomFrom("");
      setCustomTo("");
      setIsCustomDateOpen(false);
      setIsDateMenuOpen(false);
    },
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
    onCustomFromChange: setCustomFrom,
    onCustomToChange: setCustomTo,
    onHeaderCustomFromChange: setHeaderCustomFrom,
    onHeaderCustomToChange: setHeaderCustomTo,
    pageSize: PAGE_SIZE,
    paginatedOrders,
    payoutRows,
    payoutStatuses,
    selectedDateOption,
    summaryCards,
    totalItems,
    totalPages,
  };
}
