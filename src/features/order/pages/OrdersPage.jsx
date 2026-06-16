import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OrderFilters from "../components/OrderFilters";
import OrderMetricCard from "../components/OrderMetricCard";
import OrderPagination from "../components/OrderPagination";
import OrdersTable from "../components/OrdersTable";
import OrderTabs from "../components/OrderTabs";
import OrderDetailModal from "../components/OrderDetailModal";
import {
  orderFilterChips,
  ordersTableRows,
  orderTabs,
} from "../data/orderData";
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
} from "../../../utils/vendorAlerts";

const PAGE_SIZE = 10;

function normalizeLabel(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function getStatusFromActionLabel(label) {
  const norm = label.toLowerCase();
  if (norm.includes("prepare") || norm.includes("preparing")) return "Preparing";
  if (norm.includes("ready")) return "Ready";
  if (norm.includes("delivery") || norm.includes("out for delivery")) return "Out for delivery";
  if (norm.includes("delivered") || norm.includes("mark delivered")) return "Delivered";
  if (norm.includes("cancel") || norm.includes("canceled") || norm.includes("reject")) return "Canceled";
  if (norm.includes("accept")) return "Accepted";
  return label;
}

function getActionsForStatus(status) {
  if (status === "New") {
    return [
      { label: "Accept", tone: "is-primary", navigateToDetail: true },
      { label: "Reject", tone: "is-muted" }
    ];
  }
  if (status === "Accepted") {
    return [{ label: "Start preparing", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Preparing") {
    return [{ label: "Ready", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Ready") {
    return [{ label: "Out for delivery", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Out for delivery") {
    return [{ label: "Delivered", tone: "is-primary", hasDropdown: true }];
  }
  return [{ label: "View Details", tone: "is-muted", navigateToDetail: true }];
}

function getToneForStatus(status) {
  if (status === "New") return "is-new";
  if (status === "Accepted") return "is-accepted";
  if (status === "Preparing") return "is-preparing";
  if (status === "Ready") return "is-ready";
  if (status === "Out for delivery") return "is-delivery";
  if (status === "Delivered") return "is-delivered";
  if (status === "Canceled") return "is-canceled";
  if (status === "Reject") return "is-reject";
  return "is-new";
}

function parseOrderDateString(dateStr) {
  if (!dateStr) return new Date();

  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);

    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    const monthIndex = months.indexOf(monthName);
    if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }

  return new Date();
}

function shiftOrderDates(orders) {
  if (!orders || orders.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Distribute 15 orders across 35 days to make filters responsive
  const daysOffsets = [0, 1, 2, 4, 6, 8, 10, 12, 15, 18, 21, 24, 27, 30, 35];

  return orders.map((order, index) => {
    const daysAgo = daysOffsets[index] !== undefined ? daysOffsets[index] : index * 3.5;
    const orderDate = new Date(today.getTime());
    orderDate.setDate(today.getDate() - Math.floor(daysAgo));

    const dateStr = `${orderDate.getDate()} ${months[orderDate.getMonth()]} ${orderDate.getFullYear()}`;
    return {
      ...order,
      date: dateStr,
    };
  });
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderIdForModal, setSelectedOrderIdForModal] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState("Last Month");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [orderRows, setOrderRows] = useState(() => {
    const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
    let initialOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
    initialOrders = shiftOrderDates(initialOrders);
    window.localStorage.setItem("vendor-orders", JSON.stringify(initialOrders));
    return initialOrders;
  });

  const dateFilteredRows = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orderRows.filter((row) => {
      const rowDate = parseOrderDateString(row.date);
      if (isNaN(rowDate.getTime())) return true;
      rowDate.setHours(0, 0, 0, 0);

      if (selectedFilter === "Last 7 Days") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return rowDate >= sevenDaysAgo && rowDate <= today;
      }
      if (selectedFilter === "Last 14 Days") {
        const fourteenDaysAgo = new Date(today);
        fourteenDaysAgo.setDate(today.getDate() - 14);
        return rowDate >= fourteenDaysAgo && rowDate <= today;
      }
      if (selectedFilter === "Last Month") {
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return rowDate >= oneMonthAgo && rowDate <= today;
      }
      if (selectedFilter === "Custom Date") {
        if (!fromDate || !toDate) return true;
        const start = new Date(fromDate);
        const end = new Date(toDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return rowDate >= start && rowDate <= end;
      }
      return true;
    });
  }, [orderRows, selectedFilter, fromDate, toDate]);

  const filteredRows = useMemo(() => {
    const baseRows =
      activeTab === "All"
        ? dateFilteredRows
        : dateFilteredRows.filter((row) => normalizeLabel(row.status) === normalizeLabel(activeTab));

    const chipFilteredRows = activeFilter
      ? baseRows.filter((row) => normalizeLabel(row.status) === normalizeLabel(activeFilter))
      : baseRows;

    return [...chipFilteredRows].sort((firstRow, secondRow) =>
      secondRow.customer.localeCompare(firstRow.customer),
    );
  }, [activeFilter, activeTab, dateFilteredRows]);

  const dynamicMetrics = useMemo(() => {
    const total = dateFilteredRows.length;
    const newCount = dateFilteredRows.filter((r) => r.status === "New").length;
    const acceptedCount = dateFilteredRows.filter((r) => r.status === "Accepted").length;
    const preparingCount = dateFilteredRows.filter((r) => r.status === "Preparing").length;
    const readyCount = dateFilteredRows.filter((r) => r.status === "Ready").length;
    const deliveryCount = dateFilteredRows.filter((r) => r.status === "Out for delivery" || r.status === "Out for Delivery").length;
    const deliveredCount = dateFilteredRows.filter((r) => r.status === "Delivered").length;

    return [
      {
        label: "Total Orders",
        value: String(total),
        helper: "Active in range",
        helperTone: "is-positive",
        icon: "clipboard",
      },
      {
        label: "New Orders",
        value: String(newCount),
        helper: `${Math.round(newCount * 0.2)} urgent`,
        icon: "cart",
      },
      {
        label: "Accepted",
        value: String(acceptedCount),
        helper: `${Math.round(acceptedCount * 0.4)} prepare`,
        icon: "check",
      },
      {
        label: "Preparing",
        value: String(preparingCount),
        helper: `${Math.round(preparingCount * 0.2)} delayed`,
        icon: "chef",
      },
      {
        label: "Ready",
        value: String(readyCount),
        helper: "0 waiting",
        icon: "package",
      },
      {
        label: "Out for Delivery",
        value: String(deliveryCount),
        helper: "On the way",
        icon: "truck",
      },
      {
        label: "Delivered",
        value: String(deliveredCount),
        helper: "Completed",
        icon: "badge",
      },
    ];
  }, [dateFilteredRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    const nextFilter = searchParams.get("filter");

    if (nextTab) {
      setActiveTab(nextTab);
    }

    if (nextFilter) {
      setActiveFilter(nextFilter);
    }

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

  async function handleActionClick(row, action) {
    const orderId = row.id;

    if (action.fromDropdown) {
      const nextStatus = getStatusFromActionLabel(action.label);

      const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
      const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
      const nextOrders = currentOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: nextStatus,
            statusTone: getToneForStatus(nextStatus),
            actions: getActionsForStatus(nextStatus),
          };
        }
        return order;
      });
      window.localStorage.setItem("vendor-orders", JSON.stringify(nextOrders));
      setOrderRows(nextOrders);

      const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
      const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : {};
      const cleanId = orderId.replace("#", "");
      if (currentDetails[cleanId]) {
        currentDetails[cleanId] = {
          ...currentDetails[cleanId],
          status: nextStatus,
        };
        window.localStorage.setItem("vendor-order-details", JSON.stringify(currentDetails));
      }

      await showOrderStatusUpdated(`Status updated to ${nextStatus} for ${row.id}.`);
      return;
    }

    if (action.navigateToDetail) {
      if (action.label === "Accept") {
        const result = await confirmOrderStatusAction("Accept order", row.id);

        if (!result.isConfirmed) {
          return;
        }

        const nextStatus = "Accepted";
        const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
        const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
        const nextOrders = currentOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: nextStatus,
              statusTone: getToneForStatus(nextStatus),
              actions: getActionsForStatus(nextStatus),
            };
          }
          return order;
        });
        window.localStorage.setItem("vendor-orders", JSON.stringify(nextOrders));
        setOrderRows(nextOrders);

        const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
        const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : {};
        const cleanId = orderId.replace("#", "");
        if (currentDetails[cleanId]) {
          currentDetails[cleanId] = {
            ...currentDetails[cleanId],
            status: nextStatus,
          };
          window.localStorage.setItem("vendor-order-details", JSON.stringify(currentDetails));
        }

        await showOrderStatusUpdated(`Order ${row.id} accepted.`);
        navigate(`/orders/${row.id.replace("#", "")}`);
        return;
      }

      setSelectedOrderIdForModal(row.id);
      return;
    }

    if (action.label === "Accept") {
      const result = await confirmOrderStatusAction("Accept order", row.id);

      if (!result.isConfirmed) {
        return;
      }

      const nextStatus = "Accepted";
      const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
      const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
      const nextOrders = currentOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: nextStatus,
            statusTone: getToneForStatus(nextStatus),
            actions: getActionsForStatus(nextStatus),
          };
        }
        return order;
      });
      window.localStorage.setItem("vendor-orders", JSON.stringify(nextOrders));
      setOrderRows(nextOrders);

      const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
      const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : {};
      const cleanId = orderId.replace("#", "");
      if (currentDetails[cleanId]) {
        currentDetails[cleanId] = {
          ...currentDetails[cleanId],
          status: nextStatus,
        };
        window.localStorage.setItem("vendor-order-details", JSON.stringify(currentDetails));
      }

      await showOrderStatusUpdated(`Order ${row.id} accepted.`);
      navigate(`/orders/${row.id.replace("#", "")}`);
      return;
    }

    if (action.label === "Reject") {
      const result = await confirmOrderStatusAction("Reject order", row.id);

      if (!result.isConfirmed) {
        return;
      }

      const nextStatus = "Canceled";
      const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
      const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
      const nextOrders = currentOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: nextStatus,
            statusTone: getToneForStatus(nextStatus),
            actions: getActionsForStatus(nextStatus),
          };
        }
        return order;
      });
      window.localStorage.setItem("vendor-orders", JSON.stringify(nextOrders));
      setOrderRows(nextOrders);

      const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
      const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : {};
      const cleanId = orderId.replace("#", "");
      if (currentDetails[cleanId]) {
        currentDetails[cleanId] = {
          ...currentDetails[cleanId],
          status: nextStatus,
        };
        window.localStorage.setItem("vendor-order-details", JSON.stringify(currentDetails));
      }

      await showOrderStatusUpdated(`Order ${row.id} rejected.`);
      return;
    }

    if (action.label === "Mark delivered") {
      const result = await confirmOrderStatusAction("Mark delivered", row.id);

      if (!result.isConfirmed) {
        return;
      }

      const nextStatus = "Delivered";
      const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
      const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
      const nextOrders = currentOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: nextStatus,
            statusTone: getToneForStatus(nextStatus),
            actions: getActionsForStatus(nextStatus),
          };
        }
        return order;
      });
      window.localStorage.setItem("vendor-orders", JSON.stringify(nextOrders));
      setOrderRows(nextOrders);

      const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
      const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : {};
      const cleanId = orderId.replace("#", "");
      if (currentDetails[cleanId]) {
        currentDetails[cleanId] = {
          ...currentDetails[cleanId],
          status: nextStatus,
        };
        window.localStorage.setItem("vendor-order-details", JSON.stringify(currentDetails));
      }

      await showOrderStatusUpdated(`Order ${row.id} marked as delivered.`);
    }
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
        <OrdersTable onActionClick={handleActionClick} rows={paginatedRows} onRowClick={(row) => navigate(`/orders/${row.id.replace("#", "")}`)} />
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

      {selectedOrderIdForModal && (
        <OrderDetailModal
          orderId={selectedOrderIdForModal}
          onClose={() => setSelectedOrderIdForModal(null)}
        />
      )}
    </section>
  );
}
