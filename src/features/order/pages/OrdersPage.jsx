/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OrderFilters from "../components/OrderFilters";
import OrderMetricCard from "../components/OrderMetricCard";
import OrderPagination from "../components/OrderPagination";
import OrdersTable from "../components/OrdersTable";
import OrderTabs from "../components/OrderTabs";
import OrderDetailModal from "../components/OrderDetailModal";
import { orderFilterChips } from "../data/orderData";
import { getAllVendorOrders, updateVendorOrderStatus } from "../api/orderApi";
import {
  createOrderMetrics,
  createOrderTabs,
  getStatusMutationValue,
  mapVendorOrderSummary,
  mapVendorOrdersResult,
  normalizeBackendStatus,
} from "../api/orderMappers";
import { clearPendingAdjustment } from "../utils/pendingAdjustments";
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";
import { getEarlyDeliveryBlockMessage } from "../utils/orderSchedule";

const PAGE_SIZE = 10;

function normalizeLabel(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function parseOrderDateString(dateStr) {
  if (!dateStr || /unavailable/i.test(dateStr)) return new Date(Number.NaN);

  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = Number.parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = Number.parseInt(parts[2], 10);
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const monthIndex = months.indexOf(monthName);

    if (monthIndex >= 0 && Number.isFinite(day) && Number.isFinite(year)) {
      return new Date(year, monthIndex, day);
    }
  }

  return new Date(Number.NaN);
}

function parseOrderDateTime(row) {
  const rawDate =
    row?.eventDateRaw ||
    row?.raw?.eventDate ||
    row?.raw?.deliveryDate ||
    row?.raw?.placedAt ||
    row?.raw?.createdOn ||
    "";
  const rawTime = row?.time || row?.raw?.eventTime || "";

  if (rawDate) {
    const normalizedTime = /^\d{2}:\d{2}(:\d{2})?$/.test(String(rawTime).trim())
      ? String(rawTime).trim()
      : "00:00:00";
    const isoCandidate = `${rawDate}T${normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime}`;
    const parsedIso = new Date(isoCandidate);

    if (!Number.isNaN(parsedIso.getTime())) {
      return parsedIso;
    }
  }

  const fallbackDate = parseOrderDateString(row?.date);
  if (Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  const timeMatch = String(rawTime || "").match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    fallbackDate.setHours(
      Number.parseInt(timeMatch[1], 10),
      Number.parseInt(timeMatch[2], 10),
      Number.parseInt(timeMatch[3] || "0", 10),
      0,
    );
  }

  return fallbackDate;
}

function getStatusFromActionLabel(label) {
  return normalizeBackendStatus(label);
}

function toIsoDateString(date) {
  return date.toISOString().split("T")[0];
}

function buildBackendDateFilters(selectedFilter, fromDate, toDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedFilter === "Custom Date" && fromDate && toDate) {
    return {
      dateFrom: fromDate,
      dateTo: toDate,
    };
  }

  if (selectedFilter === "Last 7 Days") {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return {
      dateFrom: toIsoDateString(start),
      dateTo: toIsoDateString(today),
    };
  }

  if (selectedFilter === "Last 14 Days") {
    const start = new Date(today);
    start.setDate(today.getDate() - 13);
    return {
      dateFrom: toIsoDateString(start),
      dateTo: toIsoDateString(today),
    };
  }

  if (selectedFilter === "Last Month") {
    const start = new Date(today);
    start.setMonth(today.getMonth() - 1);
    return {
      dateFrom: toIsoDateString(start),
      dateTo: toIsoDateString(today),
    };
  }

  return {};
}

function getBackendStatusFilter(activeTab, activeFilter) {
  // Backend order status choices do not match the UI labels reliably.
  // We load the full vendor order set and apply tab/chip status filters client-side.
  return undefined;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All Time");
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [orderRows, setOrderRows] = useState([]);
  const [summaryCounts, setSummaryCounts] = useState(() =>
    mapVendorOrderSummary(null, []),
  );
  const [isLoading, setIsLoading] = useState(true);

  const backendQueryVariables = useMemo(() => {
    const search = searchParams.get("search")?.trim() || "";
    const status = getBackendStatusFilter(activeTab, activeFilter);
    const dateFilters = buildBackendDateFilters(selectedFilter, fromDate, toDate);

    return {
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...dateFilters,
    };
  }, [activeFilter, activeTab, fromDate, searchParams, selectedFilter, toDate]);

  useEffect(() => {
    let isCancelled = false;

    async function loadOrders() {
      setIsLoading(true);

      try {
        const result = await getAllVendorOrders(backendQueryVariables);
        if (isCancelled) {
          return;
        }

        const mappedList = mapVendorOrdersResult(result);
        const mappedSummary = mapVendorOrderSummary(mappedList.summary, mappedList.rows);

        setOrderRows(mappedList.rows);
        setSummaryCounts(mappedSummary);
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error instanceof Error ? error.message : "Unable to load vendor orders.",
          );
          setOrderRows([]);
          setSummaryCounts(mapVendorOrderSummary(null, []));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [backendQueryVariables]);

  const dateFilteredRows = orderRows;

  const rangeAwareSummary = useMemo(() => {
    const modifiedCount = dateFilteredRows.filter((row) => row.status === "Modified").length;

    return {
      ...summaryCounts,
      modified: Math.max(summaryCounts.modified || 0, modifiedCount),
    };
  }, [dateFilteredRows, summaryCounts]);

  const filteredRows = useMemo(() => {
    const baseRows =
      activeTab === "All"
        ? dateFilteredRows
        : dateFilteredRows.filter((row) => {
            if (activeTab === "Pending") {
              return ["Preparing", "Ready", "Out for delivery"].includes(row.status);
            }

            return normalizeLabel(row.status) === normalizeLabel(activeTab);
          });

    const chipFilteredRows = activeFilter
      ? baseRows.filter((row) => normalizeLabel(row.status) === normalizeLabel(activeFilter))
      : baseRows;

    const searchQuery = searchParams.get("search")?.toLowerCase().trim() || "";
    const searchedRows = searchQuery
      ? chipFilteredRows.filter(
          (row) =>
            row.id.toLowerCase().includes(searchQuery) ||
            row.customer.toLowerCase().includes(searchQuery) ||
            row.event.toLowerCase().includes(searchQuery),
        )
      : chipFilteredRows;

    return [...searchedRows].sort((firstRow, secondRow) =>
      parseOrderDateTime(secondRow).getTime() - parseOrderDateTime(firstRow).getTime(),
    );
  }, [activeFilter, activeTab, dateFilteredRows, searchParams]);

  const dynamicMetrics = useMemo(() => {
    return createOrderMetrics(rangeAwareSummary).map((metric) =>
      metric.label === "Total Orders"
        ? {
            ...metric,
            helper: selectedFilter === "All Time" ? "All orders" : "Orders in current range",
          }
        : metric,
    );
  }, [rangeAwareSummary, selectedFilter]);

  const orderTabs = useMemo(() => {
    return createOrderTabs(rangeAwareSummary);
  }, [rangeAwareSummary]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    const nextFilter = searchParams.get("filter");

    setActiveTab(nextTab || "All");
    setActiveFilter(nextFilter || "");

    if (nextTab || nextFilter) {
      setCurrentPage(1);
    }
  }, [searchParams]);

  function handleTabChange(tabLabel) {
    setActiveTab(tabLabel);
    setCurrentPage(1);
  }

  function handleFilterChange(filterLabel) {
    setActiveFilter((currentFilter) => (currentFilter === filterLabel ? "" : filterLabel));
    setCurrentPage(1);
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);
  }

  async function commitStatusChange(row, nextStatus, message) {
    await updateVendorOrderStatus({
      id: row.rawId,
      status: getStatusMutationValue(nextStatus),
      note: "",
    });

    if (nextStatus !== "Modified") {
      clearPendingAdjustment(row.rawId);
    }

    setOrderRows((currentRows) =>
      currentRows.map((currentRow) =>
        currentRow.rawId === row.rawId
          ? {
              ...currentRow,
              status: nextStatus,
              statusTone: row.statusTone,
              actions: row.actions,
            }
          : currentRow,
      ),
    );

    const refreshedResult = await getAllVendorOrders();
    const mappedList = mapVendorOrdersResult(refreshedResult);
    const mappedSummary = mapVendorOrderSummary(mappedList.summary, mappedList.rows);

    setOrderRows(mappedList.rows);
    setSummaryCounts(mappedSummary);

    await showOrderStatusUpdated(message);
  }

  async function handleActionClick(row, action) {
    try {
      const actionLabel = action?.label || "";
      const nextStatus = getStatusFromActionLabel(actionLabel);

      if (nextStatus === "Delivered") {
        const blockedMessage = getEarlyDeliveryBlockMessage(row);
        if (blockedMessage) {
          await showVendorErrorAlert(blockedMessage, "Delivery not available yet");
          return;
        }
      }

      if (action.fromDropdown) {
        await commitStatusChange(row, nextStatus, `Status updated to ${nextStatus} for ${row.id}.`);
        return;
      }

      if (action.navigateToDetail) {
        if (actionLabel === "Accept") {
          const result = await confirmOrderStatusAction("Accept order", row.id);
          if (!result.isConfirmed) {
            return;
          }

          await commitStatusChange(row, "Accepted", `Order ${row.id} accepted.`);
          navigate(`/orders/${encodeURIComponent(row.rawId)}`);
          return;
        }

        setSelectedOrderForModal(row);
        return;
      }

      if (actionLabel === "Accept") {
        const result = await confirmOrderStatusAction("Accept order", row.id);
        if (!result.isConfirmed) {
          return;
        }

        await commitStatusChange(row, "Accepted", `Order ${row.id} accepted.`);
        navigate(`/orders/${encodeURIComponent(row.rawId)}`);
        return;
      }

      if (actionLabel === "Reject") {
        const result = await confirmOrderStatusAction("Reject order", row.id);
        if (!result.isConfirmed) {
          return;
        }

        await commitStatusChange(row, "Canceled", `Order ${row.id} rejected.`);
        return;
      }

      if (actionLabel === "Mark delivered") {
        const result = await confirmOrderStatusAction("Mark delivered", row.id);
        if (!result.isConfirmed) {
          return;
        }

        await commitStatusChange(row, "Delivered", `Order ${row.id} marked as delivered.`);
      }
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error ? error.message : "Unable to update the order right now.",
      );
    }
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[360px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#cf6e38] border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-[14px]">
      <header className="flex flex-col gap-0.5">
        <h1 className="type-h2 m-0 text-[#1a1410]">Orders</h1>
        <p className="type-para m-0 ">
          Manage all your catering orders and track production status.
        </p>
      </header>

      <div className="grid grid-cols-7 gap-2 max-[1180px]:grid-cols-4 max-[960px]:grid-cols-2 max-[720px]:grid-cols-2">
        {dynamicMetrics.map((metric) => (
          <OrderMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <OrderTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={orderTabs}
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
      />

      <div className="bg-transparent px-0 pb-0 pt-0">
        <OrdersTable
          onActionClick={handleActionClick}
          rows={paginatedRows}
          onRowClick={(row) => navigate(`/orders/${encodeURIComponent(row.rawId)}`)}
        />
        <OrderFilters
          activeFilter={activeFilter}
          filters={orderFilterChips}
          onFilterChange={handleFilterChange}
          selectedCount={activeFilter ? 1 : 0}
        />
      </div>

      <OrderPagination
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pageSize={PAGE_SIZE}
        totalItems={filteredRows.length}
        totalPages={totalPages}
      />

      {selectedOrderForModal ? (
        <OrderDetailModal
          order={selectedOrderForModal}
          orderId={selectedOrderForModal.rawId}
          onClose={() => setSelectedOrderForModal(null)}
        />
      ) : null}
    </section>
  );
}
