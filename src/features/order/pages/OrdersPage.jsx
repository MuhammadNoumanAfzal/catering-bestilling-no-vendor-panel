import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orderRows, setOrderRows] = useState(ordersTableRows);

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
    if (action.fromDropdown) {
      setOrderRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.id === row.id
            ? {
                ...currentRow,
                actions: currentRow.actions.map((currentAction, index) =>
                  index === 0 ? { ...currentAction, label: action.label, hasDropdown: true } : currentAction,
                ),
              }
            : currentRow,
        ),
      );
      await showOrderStatusUpdated(`${action.label} updated for ${row.id}.`);
      return;
    }

    if (action.navigateToDetail) {
      navigate(`/orders/${row.id.replace("#", "")}`);
      return;
    }

    if (action.label === "Accept") {
      const result = await confirmOrderStatusAction("Accept order", row.id);

      if (!result.isConfirmed) {
        return;
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

      setOrderRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.id === row.id
            ? {
                ...currentRow,
                status: "Canceled",
                statusTone: "is-canceled",
                actions: [{ label: "View Details", tone: "is-muted" }],
              }
            : currentRow,
        ),
      );
      await showOrderStatusUpdated(`Order ${row.id} rejected.`);
      return;
    }

    if (action.label === "Mark delivered") {
      const result = await confirmOrderStatusAction("Mark delivered", row.id);

      if (!result.isConfirmed) {
        return;
      }

      setOrderRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.id === row.id
            ? {
                ...currentRow,
                status: "Delivered",
                statusTone: "is-delivered",
                actions: [{ label: "View Details", tone: "is-muted" }],
              }
            : currentRow,
        ),
      );
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

      <div className="grid grid-cols-7 gap-2 max-[1180px]:grid-cols-4 max-[960px]:grid-cols-2 max-[720px]:grid-cols-1">
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
