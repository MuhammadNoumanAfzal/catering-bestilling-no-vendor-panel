import i18n from "../../../i18n";
import { translateFinanceText } from "../financeTranslations";
import { useEffect, useMemo, useState } from "react";
import {
  exportVendorFinanceTransactions,
  getVendorPayouts,
} from "../api/financeApi";
import {
  getFinanceDateRangeVariables,
  mapFinanceSummaryCards,
  mapPayoutOverviewChart,
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
    return translateFinanceText(fallbackMessage);
  }

  const looksLikeServerTrace =
    message.includes("/home/") ||
    message.includes("Traceback") ||
    message.includes("cannot import name") ||
    message.includes("graphql_relay") ||
    message.includes("\n");

  return translateFinanceText(looksLikeServerTrace ? fallbackMessage : message);
}

function toPayoutStatusFilter(status) {
  if (!status || status === "All") {
    return undefined;
  }

  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  return normalized === "RELEASED" ? "PAYOUT_RELEASED" : normalized;
}

function filterPayoutRowsByStatus(rows, status) {
  if (!status || status === "All") {
    return rows;
  }

  const expectedStatus = status.trim().toUpperCase();

  return rows.filter(
    (row) => `${row?.paymentStatus ?? ""}`.trim().toUpperCase() === expectedStatus,
  );
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(i18n.language === "nb" ? "nb-NO" : "en-GB").replace(/\//g, "-");
}

export default function useFinancePageState() {
  const [currentPage, setCurrentPage] = useState(1);
  const [headerFilter, setHeaderFilter] = useState("Last 7 Days");
  const [headerCustomFrom, setHeaderCustomFrom] = useState("");
  const [headerCustomTo, setHeaderCustomTo] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedDateOption, setSelectedDateOption] = useState("Last 7 Days");
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
  const [hasLoadedFinance, setHasLoadedFinance] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const financeRangeVariables = useMemo(
    () =>
      getFinanceDateRangeVariables({
        rangePreset: selectedDateOption,
        customFrom: appliedCustomRange?.from,
        customTo: appliedCustomRange?.to,
      }),
    [appliedCustomRange?.from, appliedCustomRange?.to, selectedDateOption],
  );

  const payoutQueryVariables = useMemo(
    () => ({
      ...(toPayoutStatusFilter(activeStatus)
        ? { status: toPayoutStatusFilter(activeStatus) }
        : {}),
      ...financeRangeVariables,
    }),
    [activeStatus, financeRangeVariables],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadHeaderData() {
      try {
        const [payoutResult] = await Promise.allSettled([
          getVendorPayouts({ first: 100, ...payoutQueryVariables }),
        ]);

        if (isCancelled) {
          return;
        }

        const payoutPayload =
          payoutResult.status === "fulfilled" ? payoutResult.value : null;

        setSummaryCards(mapFinanceSummaryCards(null, payoutPayload));
        setChartPoints(
          payoutPayload
            ? mapPayoutOverviewChart(payoutPayload, {
                rangePreset: selectedDateOption,
                customFrom: appliedCustomRange?.from,
                customTo: appliedCustomRange?.to,
              })
            : [],
        );
        setPayoutStatuses(payoutPayload ? mapPayoutStatusItems(payoutPayload) : []);
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            getSafeFinanceErrorMessage(error, FINANCE_SUMMARY_ERROR_MESSAGE),
            translateFinanceText("Finance unavailable"),
          );
        }
      }
    }

    loadHeaderData();

    return () => {
      isCancelled = true;
    };
  }, [
    activeStatus,
    appliedCustomRange?.from,
    appliedCustomRange?.to,
    financeRangeVariables,
    payoutQueryVariables,
    refreshTick,
    selectedDateOption,
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
        setPayoutRows(filterPayoutRowsByStatus(mapped.rows, activeStatus));
      } catch (error) {
        if (!isCancelled) {
          setPayoutRows([]);
          await showVendorErrorAlert(
            getSafeFinanceErrorMessage(
              error,
              FINANCE_TRANSACTIONS_ERROR_MESSAGE,
            ),
            translateFinanceText("Payout activity unavailable"),
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
  }, [activeStatus, payoutQueryVariables, refreshTick]);

  const totalItems = payoutRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedOrders = payoutRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const dateButtonLabel =
    selectedDateOption === "Custom Date" &&
    appliedCustomRange?.from &&
    appliedCustomRange?.to
      ? i18n.t("finance.dateRange", { from: formatDateLabel(appliedCustomRange.from), to: formatDateLabel(appliedCustomRange.to) })
      : selectedDateOption;

  const headerFilterLabel = dateButtonLabel;

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);
  }

  function handleStatusChange(nextStatus) {
    setActiveStatus(nextStatus);
  }

  function normalizeDateFilterOption(option) {
    const legacyMap = {
      "7days": "Last 7 Days",
      "30days": "Last Month",
      lastMonth: "Last Month",
      thisMonth: "Last Month",
      thisYear: "This Year",
      custom: "Custom Date",
    };

    return legacyMap[option] || option || "Last 7 Days";
  }

  function handleDateFilterChange(option, start = "", end = "") {
    const nextOption = normalizeDateFilterOption(option);

    setHeaderFilter(nextOption);
    setSelectedDateOption(nextOption);
    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);

    if (nextOption === "Custom Date") {
      if (!start || !end || start > end) {
        return;
      }

      setAppliedCustomRange({ from: start, to: end });
      setCustomFrom(start);
      setCustomTo(end);
      setHeaderCustomFrom(start);
      setHeaderCustomTo(end);
      return;
    }

    setAppliedCustomRange(null);
    setCustomFrom("");
    setCustomTo("");
    setHeaderCustomFrom("");
    setHeaderCustomTo("");
  }

  function handleHeaderFilterChange(nextFilter, start = "", end = "") {
    handleDateFilterChange(nextFilter, start, end);
  }

  function handleApplyHeaderCustomDate() {
    handleDateFilterChange("Custom Date", headerCustomFrom, headerCustomTo);
  }

  function handleToggleDateMenu() {
    setIsDateMenuOpen((current) => !current);
  }

  function handleSelectDateOption(optionId) {
    handleDateFilterChange(optionId);
  }

  function handleApplyCustomDate() {
    handleDateFilterChange("Custom Date", customFrom, customTo);
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
        ...financeRangeVariables,
        format,
      });

      if (result.downloadUrl && typeof window !== "undefined") {
        window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      }

      await showVendorSuccessToast(translateFinanceText("Export generated successfully."));
    } catch (error) {
      await showVendorErrorAlert(
        getSafeFinanceErrorMessage(
          error,
          "Unable to export payout activity right now. Please try again shortly.",
        ),
        translateFinanceText("Export failed"),
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
      setSelectedDateOption("All Time");
      setAppliedCustomRange(null);
      setCustomFrom("");
      setCustomTo("");
      setHeaderFilter("All Time");
      setHeaderCustomFrom("");
      setHeaderCustomTo("");
      setIsCustomDateOpen(false);
      setIsDateMenuOpen(false);
    },
    handleExport,
    handleDateFilterChange,
    handleHeaderFilterChange,
    handlePageChange,
    handleRequestTransactionDetail,
    handleSelectDateOption,
    handleStatusChange,
    handleToggleDateMenu,
    headerCustomFrom,
    headerCustomTo,
    hasLoadedFinance,
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
