import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OrderFilters from "../components/OrderFilters";
import OrderMetricCard from "../components/OrderMetricCard";
import OrderPagination from "../components/OrderPagination";
import OrdersTable from "../components/OrdersTable";
import OrderTabs from "../components/OrderTabs";
import {
  orderFilterChips,
  orderMetrics,
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

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orderRows, setOrderRows] = useState(() => {
    const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
    if (savedOrdersRaw) {
      return JSON.parse(savedOrdersRaw);
    } else {
      window.localStorage.setItem("vendor-orders", JSON.stringify(ordersTableRows));
      return ordersTableRows;
    }
  });

  const filteredRows = useMemo(() => {
    const baseRows =
      activeTab === "All"
        ? orderRows
        : orderRows.filter((row) => normalizeLabel(row.status) === normalizeLabel(activeTab));

    const chipFilteredRows = activeFilter
      ? baseRows.filter((row) => normalizeLabel(row.status) === normalizeLabel(activeFilter))
      : baseRows;

    return [...chipFilteredRows].sort((firstRow, secondRow) =>
      secondRow.customer.localeCompare(firstRow.customer),
    );
  }, [activeFilter, activeTab, orderRows]);

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
      }

      navigate(`/orders/${row.id.replace("#", "")}`);
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
        {orderMetrics.map((metric) => (
          <OrderMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <OrderTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={orderTabs}
      />

      <div className="bg-transparent px-0 pb-0 pt-0">
        <OrdersTable onActionClick={handleActionClick} rows={paginatedRows} />
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
    </section>
  );
}
