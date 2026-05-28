import FinanceChartCard from "./FinanceChartCard";
import FinancePayoutStatus from "./FinancePayoutStatus";

export default function FinanceOverviewSection({ earningsPoints, payoutStatuses }) {
  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] gap-4 max-[1120px]:grid-cols-1">
      <FinanceChartCard points={earningsPoints} />
      <FinancePayoutStatus items={payoutStatuses} />
    </div>
  );
}
