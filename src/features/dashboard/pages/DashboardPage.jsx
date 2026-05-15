import EarningChart from "../components/EarningChart";
import KitchenStatus from "../components/KitchenStatus";
import OrderCard from "../components/OrderCard";
import OverviewCard from "../components/OverviewCard";
import QuickActions from "../components/QuickActions";
import ReviewsList from "../components/ReviewsList";
import SectionCard from "../components/SectionCard";
import {
  chartValues,
  kitchenStatus,
  overviewStats,
  quickActions,
  reviews,
  urgentOrders,
} from "../data/dashboardData";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="type-h3 m-0 text-[#1c1510]">Dashboard</h1>
          <p className="type-subpara mt-1.5 text-[#7a6c61]">
            Welcome back, Raj. Here&apos;s how your business is performing today.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1">
        {overviewStats.map((stat) => (
          <OverviewCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="Urgent Orders" badgeCount={urgentOrders.length} actionLabel="View all">
        <div className="flex flex-col gap-2.5">
          {urgentOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1">
        <SectionCard title="Quick Actions">
          <QuickActions actions={quickActions} />
        </SectionCard>

        <SectionCard title="Kitchen Status">
          <KitchenStatus items={kitchenStatus} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)] gap-4 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1">
        <SectionCard title="Earning Overview" actionLabel="Last 7 Days">
          <EarningChart values={chartValues} />
        </SectionCard>

        <SectionCard title="Reviews" actionLabel="View more">
          <ReviewsList reviews={reviews} />
        </SectionCard>
      </div>
    </div>
  );
}
