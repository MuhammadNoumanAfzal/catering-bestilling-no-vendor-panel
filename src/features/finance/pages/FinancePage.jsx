import { useMemo, useState } from "react";
import FinanceChartCard from "../components/FinanceChartCard";
import FinanceFooter from "../components/FinanceFooter";
import FinanceOrdersTable from "../components/FinanceOrdersTable";
import FinancePayoutStatus from "../components/FinancePayoutStatus";
import FinanceStatCard from "../components/FinanceStatCard";
import {
  earningsPoints,
  financeOrders,
  financeSummaryCards,
  payoutStatuses,
} from "../data/financeData";

const PAGE_SIZE = 10;

export default function FinancePage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(financeOrders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return financeOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage]);

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col px-6 py-5 shadow-[0_10px_28px_rgba(53,34,19,0.05)] max-[720px]:px-4 max-[720px]:py-4">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="type-h3 m-0 text-[#15110f]">Finance &amp; Earnings</h1>
          <p className="type-para mt-1 text-[#746a62]">
            Track your income and financial performance.
          </p>
        </div>
        <button
          className="rounded-[8px] border border-[#d9d1c9] bg-white px-3 py-2 text-[11px] font-semibold text-[#4f433a]"
          type="button"
        >
          Last 7.0 days
        </button>
      </header>

      <div className="grid grid-cols-4 gap-3 max-[1120px]:grid-cols-2 max-[620px]:grid-cols-1">
        {financeSummaryCards.map((card) => (
          <FinanceStatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] gap-4 max-[1120px]:grid-cols-1">
        <FinanceChartCard points={earningsPoints} />
        <FinancePayoutStatus items={payoutStatuses} />
      </div>

      <div className="mt-4">
        <FinanceOrdersTable
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={PAGE_SIZE}
          rows={paginatedOrders}
          totalItems={financeOrders.length}
          totalPages={totalPages}
        />
      </div>

      <FinanceFooter />
    </section>
  );
}
