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
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <h1 className="dashboard-title type-h3">Dashboard</h1>
          <p className="dashboard-subtitle type-subpara">
            Welcome back, Raj. Here&apos;s how your business is performing today.
          </p>
        </div>
      </header>

      <section className="dashboard-overview-grid">
        {overviewStats.map((stat) => (
          <OverviewCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="Urgent Orders" badgeCount={urgentOrders.length} actionLabel="View all">
        <div className="dashboard-orders-stack">
          {urgentOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </SectionCard>

      <div className="dashboard-dual-grid">
        <SectionCard title="Quick Actions">
          <QuickActions actions={quickActions} />
        </SectionCard>

        <SectionCard title="Kitchen Status">
          <KitchenStatus items={kitchenStatus} />
        </SectionCard>
      </div>

      <div className="dashboard-bottom-grid">
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
