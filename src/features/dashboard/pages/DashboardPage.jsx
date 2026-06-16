import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import EarningChart from "../components/EarningChart";
import KitchenStatus from "../components/KitchenStatus";
import OrderCard from "../components/OrderCard";
import OverviewCard from "../components/OverviewCard";
import QuickActions from "../components/QuickActions";
import ReviewsList from "../components/ReviewsList";
import SectionCard from "../components/SectionCard";
import DateRangeDropdown from "../components/DateRangeDropdown";
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
  const [dateFilter, setDateFilter] = useState("Last 7 Days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const activeStats = useMemo(() => {
    let totalOrdersVal = "45";
    let upcomingVal = "5";
    let urgentOrdersVal = String(urgentOrders.length).padStart(2, '0');
    let capacityProgress = 85;

    let trend1 = "up", trendVal1 = "12.4%", timeLbl1 = "Busy hours: 11 AM - 3 PM";
    let trend2 = "up", trendVal2 = "5.8%", timeLbl2 = "Next delivery at 10:30 AM";
    let trend3 = "up", trendVal3 = "18.2%", timeLbl3 = "Critical: 2 near deadline";
    let trend4 = "up", trendVal4 = "8.5%", timeLbl4 = "Peak prep: 9 AM - 12 PM";

    if (dateFilter === "Last 2 Days") {
      totalOrdersVal = "12";
      upcomingVal = "2";
      urgentOrdersVal = "02";
      capacityProgress = 48;
      
      trend1 = "up"; trendVal1 = "8.2%"; timeLbl1 = "Busy hours: 12 PM - 2 PM";
      trend2 = "down"; trendVal2 = "15%"; timeLbl2 = "Next delivery in 45 min";
      trend3 = "down"; trendVal3 = "50%"; timeLbl3 = "Critical: 1 near deadline";
      trend4 = "down"; trendVal4 = "12%"; timeLbl4 = "Peak prep time: 10 AM";
    } else if (dateFilter === "Last 7 Days") {
      totalOrdersVal = "45";
      upcomingVal = "5";
      urgentOrdersVal = "07";
      capacityProgress = 85;
      
      trend1 = "up"; trendVal1 = "12.4%"; timeLbl1 = "Busy hours: 11 AM - 3 PM";
      trend2 = "up"; trendVal2 = "5.8%"; timeLbl2 = "Next delivery at 10:30 AM";
      trend3 = "up"; trendVal3 = "18.2%"; timeLbl3 = "Critical: 2 near deadline";
      trend4 = "up"; trendVal4 = "8.5%"; timeLbl4 = "Peak prep: 9 AM - 12 PM";
    } else if (dateFilter === "Custom Date") {
      if (startDate && endDate) {
        const diffDays = Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        totalOrdersVal = String(Math.round(diffDays * 5.8));
        upcomingVal = String(Math.min(9, Math.round(diffDays * 0.7)));
        urgentOrdersVal = String(Math.min(8, Math.round(diffDays * 0.9))).padStart(2, '0');
        capacityProgress = Math.min(95, Math.max(30, 50 + (diffDays * 3) % 40));
        
        trend1 = "up"; trendVal1 = "15.1%"; timeLbl1 = "Busy hours: 10 AM - 4 PM";
        trend2 = "none"; trendVal2 = ""; timeLbl2 = "Next delivery at 11:30 AM";
        trend3 = "up"; trendVal3 = "10%"; timeLbl3 = "All checked";
        trend4 = "up"; trendVal4 = "6%"; timeLbl4 = "Peak prep: 8 AM - 1 PM";
      } else {
        totalOrdersVal = "--";
        upcomingVal = "--";
        urgentOrdersVal = "--";
        capacityProgress = 0;
        
        trend1 = ""; trendVal1 = ""; timeLbl1 = "";
        trend2 = ""; trendVal2 = ""; timeLbl2 = "";
        trend3 = ""; trendVal3 = ""; timeLbl3 = "";
        trend4 = ""; trendVal4 = ""; timeLbl4 = "";
      }
    }

    return [
      {
        ...overviewStats[0],
        value: totalOrdersVal,
        helper: dateFilter === "Custom Date" ? "Selected range" : "2 vs yesterday",
        helperTone: dateFilter === "Custom Date" ? "" : "is-positive",
        trend: trend1,
        trendValue: trendVal1,
        timeLabel: timeLbl1,
        onClick: () => navigate("/orders"),
      },
      {
        ...overviewStats[1],
        value: upcomingVal,
        helper: dateFilter === "Custom Date" && (!startDate || !endDate) ? "Select date range" : "Next at 10:30 AM",
        trend: trend2,
        trendValue: trendVal2,
        timeLabel: timeLbl2,
        onClick: () => navigate("/orders?tab=New"),
      },
      {
        ...overviewStats[2],
        value: urgentOrdersVal,
        trend: trend3,
        trendValue: trendVal3,
        timeLabel: timeLbl3,
        onClick: () => navigate("/orders?filter=New"),
      },
      {
        ...overviewStats[3],
        value: `${capacityProgress}%`,
        helper: capacityProgress > 75 ? "High - plan your schedule" : capacityProgress > 40 ? "Moderate demand" : "Low demand",
        progress: capacityProgress,
        trend: trend4,
        trendValue: trendVal4,
        timeLabel: timeLbl4,
        onClick: () => navigate("/delivery"),
      },
    ];
  }, [dateFilter, startDate, endDate, navigate]);

  const activeChartValues = useMemo(() => {
    if (dateFilter === "Last 2 Days") {
      return [
        { month: "Yesterday", value: 48 },
        { month: "Today", value: 75 },
      ];
    } else if (dateFilter === "Last 7 Days") {
      return chartValues;
    } else if (dateFilter === "Custom Date") {
      if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        const diffTime = Math.abs(e - s);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const daysCount = Math.min(diffDays, 7);
        const result = [];
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 0; i < daysCount; i++) {
          const d = new Date(s);
          d.setDate(s.getDate() + i);
          const label = diffDays <= 7 
            ? weekdays[d.getDay()] 
            : `${d.getMonth() + 1}/${d.getDate()}`;
          const seed = d.getDate() + d.getMonth();
          const value = 25 + (seed * 7) % 70; 
          result.push({
            month: label,
            value: value,
          });
        }
        return result;
      } else {
        return [];
      }
    }
    return chartValues;
  }, [dateFilter, startDate, endDate]);

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

  function handleDateFilterChange(option, start, end) {
    setDateFilter(option);
    setStartDate(start);
    setEndDate(end);
  }

  return (
    <div className="flex flex-col gap-4 max-[720px]:gap-3">
      <header className="flex items-start justify-between gap-4 max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:gap-2">
        <div>
          <h1 className="type-h2 m-0 text-[#1c1510]">Dashboard</h1>
          <p className="type-para mt-1.5 ">
            Welcome back, Nouman. Here&apos;s how your business is performing
            today.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[960px]:grid-cols-1 max-[640px]:grid-cols-2">
        {activeStats.map((stat) => (
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
            subtitle={
              dateFilter === "Custom Date"
                ? startDate && endDate
                  ? `Revenue performance from ${startDate} to ${endDate}`
                  : "Please select a custom date range above"
                : `Revenue performance over the ${dateFilter.toLowerCase()}`
            }
            values={activeChartValues}
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
