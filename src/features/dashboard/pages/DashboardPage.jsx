import { useNavigate } from "react-router-dom";

import EarningChart from "../components/EarningChart";
import KitchenStatus from "../components/KitchenStatus";
import OrderCard from "../components/OrderCard";
import OverviewCard from "../components/OverviewCard";
import QuickActions from "../components/QuickActions";
import ReviewsList from "../components/ReviewsList";
import SectionCard from "../components/SectionCard";
import DateRangeDropdown from "../components/DateRangeDropdown";
import useDashboardPageState from "../hooks/useDashboardPageState";

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    chartSubtitle,
    chartValues,
    chartYAxisLabels,
    dashboardKitchenStatus,
    dashboardQuickActions,
    handleDateFilterChange,
    handleUrgentOrderPrimaryAction,
    handleUrgentOrderSecondaryAction,
    isLoading,
    isRefreshing,
    overviewCards,
    reviews,
    startDate,
    urgentOrders,
    urgentOrdersCount,
    welcomeName,
    endDate,
    dateFilter,
  } = useDashboardPageState();

  return (
    <div className="flex flex-col gap-4 max-[720px]:gap-3">
      <header className="flex items-start justify-between gap-4 max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:gap-2">
        <div>
          <h1 className="type-h2 m-0 text-[#1c1510]">Dashboard</h1>
          <p className="type-para mt-1.5 ">
            Welcome back, {welcomeName || "Vendor"}. Here&apos;s how your business is
            performing today.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1 max-[640px]:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[120px] animate-pulse rounded-[10px] border border-[#e8e2da] bg-white"
              />
            ))
          : overviewCards.map((stat) => (
              <OverviewCard
                key={stat.label}
                {...stat}
                onClick={
                  stat.label === "Total Orders"
                    ? () => navigate("/orders")
                    : stat.label === "Upcoming (Next 4 hrs)"
                      ? () => navigate("/orders?tab=New")
                      : stat.label === "Urgent Orders"
                        ? () => navigate("/orders?filter=New")
                        : () => navigate("/delivery")
                }
              />
            ))}
      </section>

      <SectionCard
        title="Urgent Orders"
        badgeCount={urgentOrdersCount}
        actionLabel="View all"
        onActionClick={() => navigate("/orders?filter=New")}
      >
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[138px] animate-pulse rounded-[14px] border border-[#efc1bc] bg-white"
              />
            ))}
          </div>
        ) : urgentOrders.length ? (
          <div className="flex flex-col gap-2.5">
            {urgentOrders.map((order) => (
              <OrderCard
                key={order.id}
                onPrimaryAction={handleUrgentOrderPrimaryAction}
                onSecondaryAction={handleUrgentOrderSecondaryAction}
                order={order}
              />
            ))}
          </div>
        ) : (
          <p className="type-para text-[#6f645b]">No urgent orders found for the selected range.</p>
        )}
      </SectionCard>

      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1">
        <SectionCard title="Quick Actions">
          <QuickActions actions={dashboardQuickActions} />
        </SectionCard>

        <SectionCard title="Kitchen Status">
          <KitchenStatus items={dashboardKitchenStatus} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)] gap-4 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1">
        <SectionCard
          title="Earning Overview"
          action={
            <DateRangeDropdown
              onChange={handleDateFilterChange}
              initialOption={dateFilter}
              initialStart={startDate}
              initialEnd={endDate}
            />
          }
        >
          <EarningChart
            emptyTitle={dateFilter === "Custom Date" ? "No data available" : "No earnings available"}
            emptyMessage={
              dateFilter === "Custom Date"
                ? "No earnings data is available for the selected custom range."
                : "No earnings data is available for the selected range."
            }
            subtitle={
              chartSubtitle
            }
            values={chartValues}
            yAxisLabels={chartYAxisLabels}
          />
        </SectionCard>

        <SectionCard
          title="Reviews"
          actionLabel="View more"
          onActionClick={() => navigate("/reviews")}
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-[10px] bg-[#f5eee8]" />
              ))}
            </div>
          ) : reviews.length ? (
            <ReviewsList onManageReviews={() => navigate("/reviews")} reviews={reviews} />
          ) : (
            <div>
              <p className="type-para -mt-1 max-[720px]:text-[12px]">Customer feedback on latest events</p>
              <p className="type-para mt-3 text-[#6f645b]">No recent reviews found for the selected range.</p>
            </div>
          )}
        </SectionCard>
      </div>

      {isRefreshing ? (
        <p className="type-para text-right text-[12px] text-[#8d7e72]">Refreshing dashboard...</p>
      ) : null}
    </div>
  );
}
