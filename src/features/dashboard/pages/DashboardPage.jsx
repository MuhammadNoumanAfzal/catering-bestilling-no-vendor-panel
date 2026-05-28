import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
} from "../../../utils/vendorAlerts";

const MENU_SELECTED_ITEM_STORAGE_KEY = "vendor-menu-selected-item";
const MENU_DRAFT_STORAGE_KEY = "vendor-menu-builder-state";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState("Last 7 Days");

  const chartRangeValues = useMemo(
    () => ({
      "Last 7 Days": chartValues,
      "Last 30 Days": chartValues.map((item, index) => ({
        ...item,
        value: Math.max(24, item.value - 10 + index * 2),
      })),
      "Last 90 Days": chartValues.map((item, index) => ({
        ...item,
        value: Math.max(18, item.value - 18 + index * 4),
      })),
    }),
    [],
  );

  const dashboardOverviewStats = [
    {
      ...overviewStats[0],
      onClick: () => navigate("/orders"),
    },
    {
      ...overviewStats[1],
      onClick: () => navigate("/orders?tab=New"),
    },
    {
      ...overviewStats[2],
      onClick: () => navigate("/orders?filter=New"),
    },
    {
      ...overviewStats[3],
      onClick: () => navigate("/delivery"),
    },
  ];

  const dashboardQuickActions = quickActions.map((action) => ({
    ...action,
    onClick:
      action.label === "Add new menu items"
        ? () => {
            window.localStorage.removeItem(MENU_SELECTED_ITEM_STORAGE_KEY);
            window.localStorage.removeItem(MENU_DRAFT_STORAGE_KEY);
            navigate("/menu/create");
          }
        : action.label === "View Pending Orders"
          ? () => navigate("/orders?tab=Pending")
          : () => navigate("/delivery"),
  }));

  const dashboardKitchenStatus = kitchenStatus.map((item) => ({
    ...item,
    onClick: () => navigate(`/orders?filter=${encodeURIComponent(item.label)}`),
    goToOrders: () => navigate("/orders"),
  }));

  async function handleUrgentOrderPrimaryAction(order) {
    const result = await confirmOrderStatusAction("Start preparing", order.id);

    if (!result.isConfirmed) {
      return;
    }

    await showOrderStatusUpdated(`${order.id} moved to preparing.`);
    navigate(`/orders?filter=${encodeURIComponent("Preparing")}`);
  }

  function handleUrgentOrderSecondaryAction(order) {
    navigate(`/orders/${order.id.replace("#", "")}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="type-h2 m-0 text-[#1c1510]">Dashboard</h1>
          <p className="type-para mt-1.5 ">
            Welcome back, Raj. Here&apos;s how your business is performing
            today.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1">
        {dashboardOverviewStats.map((stat) => (
          <OverviewCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard
        title="Urgent Orders"
        badgeCount={urgentOrders.length}
        actionLabel="View all"
        onActionClick={() => navigate("/orders?filter=New")}
      >
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
          actionLabel={chartRange}
          actionVariant="dropdown"
          actionOptions={["Last 7 Days", "Last 30 Days", "Last 90 Days"]}
          activeActionOption={chartRange}
          onActionOptionSelect={setChartRange}
        >
          <EarningChart
            subtitle={`Revenue performance over the ${chartRange.toLowerCase()}`}
            values={chartRangeValues[chartRange]}
          />
        </SectionCard>

        <SectionCard
          title="Reviews"
          actionLabel="View more"
          onActionClick={() => navigate("/reviews")}
        >
          <ReviewsList onManageReviews={() => navigate("/reviews")} reviews={reviews} />
        </SectionCard>
      </div>
    </div>
  );
}
