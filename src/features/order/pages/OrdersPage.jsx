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

const PAGE_SIZE = 4;

function normalizeLabel(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("");
  const [sortOption, setSortOption] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    const baseRows =
      activeTab === "All"
        ? ordersTableRows
        : ordersTableRows.filter((row) => normalizeLabel(row.status) === normalizeLabel(activeTab));

    const chipFilteredRows = activeFilter
      ? baseRows.filter((row) => normalizeLabel(row.status) === normalizeLabel(activeFilter))
      : baseRows;

    return [...chipFilteredRows].sort((firstRow, secondRow) => {
      if (sortOption === "Oldest") {
        return firstRow.customer.localeCompare(secondRow.customer);
      }

      return secondRow.customer.localeCompare(firstRow.customer);
    });
  }, [activeFilter, activeTab, sortOption]);

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

  function handleSortToggle() {
    setSortOption((currentSort) => (currentSort === "Latest" ? "Oldest" : "Latest"));
    setCurrentPage(1);
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);
  }

  function handleActionClick(row, action) {
    if (action.navigateToDetail) {
      navigate(`/orders/${row.id.replace("#", "")}`);
    }
  }

  return (
    <section className="flex flex-col gap-[14px]">
      <header className="flex flex-col gap-0.5">
        <h1 className="type-h3 m-0 text-[#1a1410]">Orders</h1>
        <p className="type-subpara m-0 text-[#75695f]">
          Manage all your catering orders and track production status.
        </p>
      </header>

      <div className="grid grid-cols-7 gap-2 max-[1180px]:grid-cols-4 max-[960px]:grid-cols-2 max-[720px]:grid-cols-1">
        {orderMetrics.map((metric) => (
          <OrderMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="rounded-xl border border-[#dfd8cf] bg-white px-2 pb-2.5 pt-2 shadow-[0_2px_8px_rgba(42,27,18,0.06)]">
        <OrderTabs
          activeTab={activeTab}
          onSortToggle={handleSortToggle}
          onTabChange={handleTabChange}
          sortOption={sortOption}
          tabs={orderTabs}
        />
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
