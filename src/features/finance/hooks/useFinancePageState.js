import { useEffect, useMemo, useState } from "react";
import {
  exportVendorFinanceTransactions,
  getVendorFinanceOverviewChart,
  getVendorFinanceSummary,
  getVendorFinanceTransactionDetail,
  getVendorFinanceTransactions,
  getVendorPayoutStatus,
} from "../api/financeApi";
import {
  buildFinanceOrderTotalsLookup,
  getChartGroupBy,
  getFinanceRangeVariables,
  mapFinanceChartPoints,
  mapFinanceSummaryCards,
  mapPayoutStatusItems,
  mapTransactionDetail,
  mapTransactionsConnection,
} from "../api/financeMappers";
import { getAllVendorOrders } from "../../order/api/orderApi";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const PAGE_SIZE = 10;

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
  const [pageCache, setPageCache] = useState({});
  const [orderTotalsLookup, setOrderTotalsLookup] = useState(() => new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const headerRangeVariables = useMemo(
    () =>
      getFinanceRangeVariables({
        rangePreset: headerFilter,
        customFrom: appliedHeaderCustomRange?.from,
        customTo: appliedHeaderCustomRange?.to,
      }),
    [appliedHeaderCustomRange?.from, appliedHeaderCustomRange?.to, headerFilter],
  );

  const ordersRangeVariables = useMemo(
    () =>
      getFinanceRangeVariables({
        rangePreset: selectedDateOption,
        customFrom: appliedCustomRange?.from,
        customTo: appliedCustomRange?.to,
      }),
    [appliedCustomRange?.from, appliedCustomRange?.to, selectedDateOption],
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
          getVendorPayoutStatus(),
        ]);

        if (isCancelled) {
          return;
        }

        if (summaryResult.status !== "fulfilled" || chartResult.status !== "fulfilled") {
          const summaryError =
            summaryResult.status === "rejected" ? summaryResult.reason : null;
          const chartError =
            chartResult.status === "rejected" ? chartResult.reason : null;

          throw summaryError || chartError || new Error("Unable to load finance summary right now.");
        }

        setSummaryCards(mapFinanceSummaryCards(summaryResult.value));
        setChartPoints(mapFinanceChartPoints(chartResult.value));

        if (payoutResult.status === "fulfilled") {
          setPayoutStatuses(mapPayoutStatusItems(payoutResult.value));
        } else {
          setPayoutStatuses([]);
        }
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load finance summary right now.",
            "Finance unavailable",
          );
        }
      }
    }

    loadHeaderData();

    return () => {
      isCancelled = true;
    };
  }, [appliedHeaderCustomRange?.from, appliedHeaderCustomRange?.to, headerFilter, headerRangeVariables]);

  useEffect(() => {
    let isCancelled = false;

    async function loadTransactions() {
      setIsLoading(true);

      try {
        const [result, ordersResult] = await Promise.all([
          getVendorFinanceTransactions({
            first: PAGE_SIZE,
            ...(activeStatus !== "All" ? { status: activeStatus.toLowerCase() } : {}),
            ...ordersRangeVariables,
          }),
          getAllVendorOrders(ordersRangeVariables),
        ]);

        if (isCancelled) {
          return;
        }

        const nextOrderTotalsLookup = buildFinanceOrderTotalsLookup(ordersResult);
        const mapped = mapTransactionsConnection(result, nextOrderTotalsLookup);
        setOrderTotalsLookup(nextOrderTotalsLookup);
        setPageCache({ 1: mapped });
        setCurrentPage(1);
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load finance transactions right now.",
            "Transactions unavailable",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      isCancelled = true;
    };
  }, [activeStatus, ordersRangeVariables]);

  const currentPageData = pageCache[currentPage] || {
    rows: [],
    pageInfo: {
      hasNextPage: false,
      endCursor: "",
    },
    totalCount: 0,
  };

  const paginatedOrders = currentPageData.rows;
  const totalItems = currentPageData.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

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

    if (pageCache[nextPage]) {
      setCurrentPage(nextPage);
      return;
    }

    if (nextPage < currentPage) {
      setCurrentPage(nextPage);
      return;
    }

    try {
      setIsLoading(true);
      let nextCache = { ...pageCache };
      let lastKnownPage = currentPage;

      while (lastKnownPage < nextPage) {
        const currentData = nextCache[lastKnownPage];

        if (!currentData?.pageInfo?.hasNextPage || !currentData?.pageInfo?.endCursor) {
          break;
        }

        const result = await getVendorFinanceTransactions({
          first: PAGE_SIZE,
          after: currentData.pageInfo.endCursor,
          ...(activeStatus !== "All" ? { status: activeStatus.toLowerCase() } : {}),
          ...ordersRangeVariables,
        });
        nextCache[lastKnownPage + 1] = mapTransactionsConnection(result, orderTotalsLookup);
        lastKnownPage += 1;
      }

      setPageCache(nextCache);
      setCurrentPage(Math.min(nextPage, lastKnownPage));
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to load more transactions right now.",
        "Pagination failed",
      );
    } finally {
      setIsLoading(false);
    }
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
    const result = await getVendorFinanceTransactionDetail(id);
    return mapTransactionDetail(result?.vendorFinanceTransaction, orderTotalsLookup);
  }

  async function handleExport(format) {
    try {
      setIsExporting(true);
      const result = await exportVendorFinanceTransactions({
        ...(activeStatus !== "All" ? { status: activeStatus.toLowerCase() } : {}),
        ...ordersRangeVariables,
        format,
      });

      if (result.downloadUrl && typeof window !== "undefined") {
        window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      }

      await showVendorSuccessToast(result.message || "Export generated successfully.");
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to export transactions right now.",
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
