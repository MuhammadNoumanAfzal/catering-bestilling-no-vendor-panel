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
    businessProfilePrompt,
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

      {businessProfilePrompt.isVisible ? (
        <section className="relative overflow-hidden rounded-[28px] border border-[#f0ddd0] bg-[linear-gradient(135deg,#fffdfb_0%,#fff6f0_46%,#fff1e7_100%)] px-6 py-6 shadow-[0_18px_46px_rgba(45,31,20,0.07)] max-[720px]:px-4 max-[720px]:py-5">
          <div className="pointer-events-none absolute right-[-40px] top-[-56px] h-[170px] w-[170px] rounded-full bg-[radial-gradient(circle,_rgba(206,106,56,0.18)_0%,_rgba(206,106,56,0)_72%)]" />
          <div className="pointer-events-none absolute bottom-[-70px] left-[20%] h-[150px] w-[150px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.95)_0%,_rgba(255,255,255,0)_72%)]" />

          <div className="relative flex items-start justify-between gap-5 max-[920px]:flex-col max-[920px]:items-stretch">
            <div className="max-w-[760px]">
              <span className="inline-flex rounded-full border border-[#f5d9c9] bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c86535] shadow-[0_10px_22px_rgba(206,106,56,0.08)] backdrop-blur-sm">
                Business setup
              </span>
              <h2 className="mt-4 text-[28px] font-bold leading-tight text-[#201711] max-[720px]:text-[22px]">
                Complete your business profile
              </h2>
              <p className="type-para mt-2.5 max-w-[640px] text-[15px] leading-[1.7] text-[#6f645b]">
                Finish your core business details to make your storefront look trustworthy, unlock a fully polished dashboard, and help customers book with confidence.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {businessProfilePrompt.missingLabels.slice(0, 5).map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-[#f1ddd0] bg-white/88 px-3 py-1.5 text-[12px] font-medium capitalize text-[#5c4940] shadow-[0_8px_18px_rgba(45,31,20,0.04)]"
                  >
                    {item}
                  </span>
                ))}
                {businessProfilePrompt.missingCount > 5 ? (
                  <span className="inline-flex items-center rounded-full border border-[#f1ddd0] bg-[#fff7f1] px-3 py-1.5 text-[12px] font-semibold text-[#c86535]">
                    +{businessProfilePrompt.missingCount - 5} more
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex min-w-[260px] shrink-0 flex-col items-stretch gap-4 rounded-[24px] border border-white/70 bg-white/88 p-4 shadow-[0_16px_30px_rgba(45,31,20,0.08)] backdrop-blur-sm max-[920px]:min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#d97543_0%,#c85f31_100%)] text-[18px] font-bold text-white shadow-[0_12px_24px_rgba(206,106,56,0.22)]">
                  {businessProfilePrompt.missingCount}
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#b07a5a]">
                    Remaining items
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-[#201711]">
                    Finish your setup
                  </p>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#f6e8dd]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#d97543_0%,#efb08a_100%)]"
                  style={{
                    width: `${Math.max(
                      12,
                      Math.min(100, ((10 - businessProfilePrompt.missingCount) / 10) * 100),
                    )}%`,
                  }}
                />
              </div>

              <p className="text-[13px] leading-[1.6] text-[#6f645b]">
                Add the missing details once, and your business page will feel complete and ready for customers.
              </p>

              <button
                className="inline-flex min-h-[50px] cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(135deg,#d97543_0%,#c85f31_100%)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(206,106,56,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_32px_rgba(206,106,56,0.28)]"
                onClick={() => navigate("/settings")}
                type="button"
              >
                Complete business details
              </button>
            </div>
          </div>
        </section>
      ) : null}

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
