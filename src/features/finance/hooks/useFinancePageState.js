import { useEffect, useMemo, useRef, useState } from "react";
import {
  exportVendorFinanceTransactions,
  getVendorFinanceOverviewChart,
  getVendorFinanceSummary,
  getVendorInvoices,
  getVendorPayouts,
} from "../api/financeApi";
import {
  getChartGroupBy,
  getFinanceDateRangeVariables,
  getFinanceSummaryVariables,
  mapFinanceChartPoints,
  mapFinanceSummaryCards,
  mapPayoutStatusItems,
  mapTransactionDetail,
  mapTransactionsConnection,
} from "../api/financeMappers";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const PAGE_SIZE = 10;
const FINANCE_SUMMARY_ERROR_MESSAGE =
  "Unable to load finance summary right now. Please try again shortly.";
const FINANCE_TRANSACTIONS_ERROR_MESSAGE =
  "Unable to load finance transactions right now. Please try again shortly.";

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

function toInvoiceStatusFilter(status) {
  if (!status || status === "All") {
    return undefined;
  }

  return status.toUpperCase().replace(/\s+/g, "_");
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export default function useFinancePageState() {
  const invoicePageCacheRef = useRef({});
  const invoicePageInfoRef = useRef({});
  const invoiceRequestIdRef = useRef(0);
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
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [invoiceTotalCount, setInvoiceTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const headerRangeVariables = useMemo(
    () =>
      getFinanceSummaryVariables({
        rangePreset: headerFilter,
        customFrom: appliedHeaderCustomRange?.from,
        customTo: appliedHeaderCustomRange?.to,
      }),
    [appliedHeaderCustomRange?.from, appliedHeaderCustomRange?.to, headerFilter],
  );

  const ordersRangeVariables = useMemo(
    () =>
      getFinanceDateRangeVariables({
        rangePreset: selectedDateOption,
        customFrom: appliedCustomRange?.from,
        customTo: appliedCustomRange?.to,
      }),
    [appliedCustomRange?.from, appliedCustomRange?.to, selectedDateOption],
  );

  const payoutRangeVariables = useMemo(
    () =>
      getFinanceDateRangeVariables({
        rangePreset: headerFilter,
        customFrom: appliedHeaderCustomRange?.from,
        customTo: appliedHeaderCustomRange?.to,
      }),
    [appliedHeaderCustomRange?.from, appliedHeaderCustomRange?.to, headerFilter],
  );

  const invoiceQueryVariables = useMemo(
    () => ({
      ...(toInvoiceStatusFilter(activeStatus)
        ? { status: toInvoiceStatusFilter(activeStatus) }
        : {}),
      ...ordersRangeVariables,
    }),
    [activeStatus, ordersRangeVariables],
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
          getVendorPayouts(payoutRangeVariables),
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

        if (payoutPayload) {
          setPayoutStatuses(mapPayoutStatusItems(payoutPayload));
        } else {
          setPayoutStatuses([]);
        }
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
    payoutRangeVariables,
  ]);

  useEffect(() => {
    invoicePageCacheRef.current = {};
    invoicePageInfoRef.current = {};
    setInvoiceRows([]);
    setInvoiceTotalCount(0);
    setIsLoading(true);
    setCurrentPage(1);
  }, [invoiceQueryVariables]);

  useEffect(() => {
    let isCancelled = false;

    if (!Object.keys(invoicePageCacheRef.current).length && currentPage !== 1) {
      return () => {
        isCancelled = true;
      };
    }

    async function fetchInvoicePage(pageNumber, afterCursor) {
      const result = await getVendorInvoices({
        first: PAGE_SIZE,
        after: afterCursor,
        ...invoiceQueryVariables,
      });

      const mapped = mapTransactionsConnection(result);

      invoicePageCacheRef.current[pageNumber] = mapped.rows;
      invoicePageInfoRef.current[pageNumber] = mapped.pageInfo;

      return mapped;
    }

    async function loadTransactionsPage() {
      const requestId = invoiceRequestIdRef.current + 1;
      invoiceRequestIdRef.current = requestId;
      setIsLoading(true);

      try {
        let mapped = null;

        if (invoicePageCacheRef.current[currentPage]) {
          mapped = {
            rows: invoicePageCacheRef.current[currentPage],
            pageInfo: invoicePageInfoRef.current[currentPage] || {},
            totalCount: invoiceTotalCount,
          };
        } else {
          let startPage = 1;
          let afterCursor;

          for (let page = currentPage - 1; page >= 1; page -= 1) {
            const pageInfo = invoicePageInfoRef.current[page];

            if (invoicePageCacheRef.current[page] && pageInfo) {
              startPage = page + 1;
              afterCursor = pageInfo.endCursor || undefined;
              break;
            }
          }

          for (let page = startPage; page <= currentPage; page += 1) {
            if (invoicePageCacheRef.current[page]) {
              afterCursor =
                invoicePageInfoRef.current[page]?.endCursor || undefined;
              mapped = {
                rows: invoicePageCacheRef.current[page],
                pageInfo: invoicePageInfoRef.current[page] || {},
                totalCount: invoiceTotalCount,
              };
              continue;
            }

            mapped = await fetchInvoicePage(page, afterCursor);
            afterCursor = mapped.pageInfo.endCursor || undefined;

            if (!mapped.pageInfo.hasNextPage && page < currentPage) {
              break;
            }
          }
        }

        if (
          isCancelled ||
          invoiceRequestIdRef.current !== requestId ||
          !mapped
        ) {
          return;
        }

        setInvoiceRows(invoicePageCacheRef.current[currentPage] || []);
        setInvoiceTotalCount(mapped.totalCount);
      } catch (error) {
        if (!isCancelled && invoiceRequestIdRef.current === requestId) {
          await showVendorErrorAlert(
            getSafeFinanceErrorMessage(
              error,
              FINANCE_TRANSACTIONS_ERROR_MESSAGE,
            ),
            "Transactions unavailable",
          );
        }
      } finally {
        if (!isCancelled && invoiceRequestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }

    loadTransactionsPage();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, invoiceQueryVariables]);

  const totalItems = invoiceTotalCount;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedOrders = invoiceRows;

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
    if (!headerCustomFrom || !headerCustomTo) {
      return;
    }

    if (headerCustomFrom > headerCustomTo) {
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
    return mapTransactionDetail(invoiceRows.find((row) => row.id === id) || null);
  }

  async function handleExport(format) {
    try {
      setIsExporting(true);
      const result = await exportVendorFinanceTransactions({
        ...(toInvoiceStatusFilter(activeStatus)
          ? { status: toInvoiceStatusFilter(activeStatus) }
          : {}),
        ...ordersRangeVariables,
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
          "Unable to export transactions right now. Please try again shortly.",
        ),
        "Export failed",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return {
    activeStatus,
    customFrom,
    customTo,
    dateButtonLabel,
    chartPoints,
    handleApplyHeaderCustomDate,
    handleApplyCustomDate,
    handleExport,
    handlePageChange,
    handleRequestTransactionDetail,
    handleSelectDateOption,
    handleStatusChange,
    handleHeaderFilterChange,
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
    payoutStatuses,
    paginatedOrders,
    pageSize: PAGE_SIZE,
    summaryCards,
    totalItems,
    totalPages,
    currentPage,
    selectedDateOption,
    handleClearDateFilter: () => {
      setSelectedDateOption("30days");
      setAppliedCustomRange(null);
      setCustomFrom("");
      setCustomTo("");
      setIsCustomDateOpen(false);
      setIsDateMenuOpen(false);
    },
  };
}
