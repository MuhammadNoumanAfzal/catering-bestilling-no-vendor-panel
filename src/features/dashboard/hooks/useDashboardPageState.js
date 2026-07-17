import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorDashboard } from "../api/dashboardApi";
import {
  buildCustomDateLabel,
  buildDashboardQueryVariables,
  createEmptyDashboardState,
  mapDashboardResponse,
} from "../api/dashboardMappers";
import { getAllVendorOrders, updateVendorOrderStatus } from "../../order/api/orderApi";
import { mapVendorOrderSummary, mapVendorOrdersResult } from "../../order/api/orderMappers";
import { getVendorSettingsPage } from "../../settings/api/settingsApi";
import { mapVendorSettingsPage } from "../../settings/api/settingsMappers";
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";

const quickActions = [
  {
    label: "Add new menu items",
    icon: "plus",
  },
  {
    label: "View Pending Orders",
    icon: "calendar",
  },
  {
    label: "Update Availability",
    icon: "alert",
  },
];

const BUSINESS_PROFILE_CHECKS = [
  { key: "businessName", label: "business name" },
  { key: "businessEmail", label: "business email" },
  { key: "phoneNumber", label: "phone number" },
  { key: "businessAddress", label: "business address" },
  { key: "businessType", label: "business type" },
  { key: "cuisineType", label: "cuisine type" },
  { key: "businessDescription", label: "business description" },
];

function normalizeString(value) {
  return value == null ? "" : String(value).trim();
}

function buildBusinessProfilePrompt(settings) {
  if (!settings) {
    return {
      isVisible: false,
      missingCount: 0,
      missingLabels: [],
    };
  }

  const missingLabels = BUSINESS_PROFILE_CHECKS.filter(
    (item) => !normalizeString(settings[item.key]),
  ).map((item) => item.label);

  if (!settings.profileImage?.fileUrl) {
    missingLabels.push("logo");
  }

  if (!settings.bannerImage?.fileUrl) {
    missingLabels.push("cover photo");
  }

  if (!settings.hours?.some((item) => item.enabled && item.open !== "Closed" && item.close !== "Closed")) {
    missingLabels.push("business hours");
  }

  return {
    isVisible: missingLabels.length > 0,
    missingCount: missingLabels.length,
    missingLabels,
  };
}

export default function useDashboardPageState() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState("Last 7 Days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dashboard, setDashboard] = useState(createEmptyDashboardState);
  const [businessProfilePrompt, setBusinessProfilePrompt] = useState({
    isVisible: false,
    missingCount: 0,
    missingLabels: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryVariables = useMemo(
    () => buildDashboardQueryVariables({ dateFilter, startDate, endDate }),
    [dateFilter, endDate, startDate],
  );

  const customDateLabel = useMemo(
    () => buildCustomDateLabel(startDate, endDate),
    [endDate, startDate],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard({ silent = false } = {}) {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [result, ordersResult, settingsResult] = await Promise.all([
          getVendorDashboard(queryVariables),
          getAllVendorOrders(),
          getVendorSettingsPage(),
        ]);

        if (isCancelled) {
          return;
        }

        const mappedOrders = mapVendorOrdersResult(ordersResult);
        const kitchenSummary = mapVendorOrderSummary(null, mappedOrders.rows);

        setDashboard(
          mapDashboardResponse(result, {
            dateFilterLabel: dateFilter,
            customDateLabel,
            kitchenSummary,
          }),
        );

        const mappedSettingsPage = mapVendorSettingsPage(settingsResult);
        setBusinessProfilePrompt(buildBusinessProfilePrompt(mappedSettingsPage.settings));
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load dashboard data right now.",
            "Dashboard unavailable",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [customDateLabel, dateFilter, queryVariables]);

  const dashboardQuickActions = useMemo(
    () =>
      quickActions.map((action) => ({
        ...action,
        onClick:
          action.label === "Add new menu items"
            ? () => navigate("/menu/create")
            : action.label === "View Pending Orders"
              ? () => navigate("/orders?tab=Pending")
              : () => navigate("/delivery"),
      })),
    [navigate],
  );

  const dashboardKitchenStatus = useMemo(
    () =>
      dashboard.kitchenStatus.map((item) => ({
        ...item,
        onClick: () => navigate(`/orders?filter=${encodeURIComponent(item.label)}`),
        goToOrders: () => navigate("/orders"),
      })),
    [dashboard.kitchenStatus, navigate],
  );

  async function handleUrgentOrderPrimaryAction(order) {
    const result = await confirmOrderStatusAction("Start preparing", order.id);

    if (!result.isConfirmed || !order?.rawId) {
      return;
    }

    try {
      setIsRefreshing(true);
      await updateVendorOrderStatus({
        id: order.rawId,
        status: "Preparing",
      });

      setDashboard((current) => ({
        ...current,
        urgentOrders: current.urgentOrders.filter((item) => item.rawId !== order.rawId),
        urgentOrdersCount: Math.max(0, current.urgentOrdersCount - 1),
        kitchenStatus: current.kitchenStatus.map((item) =>
          item.label === "Preparing"
            ? { ...item, value: String(Number(item.value || 0) + 1) }
            : item,
        ),
      }));

      await showOrderStatusUpdated(`${order.id} moved to preparing.`);
      navigate(`/orders/${order.rawId}`);
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to update this urgent order right now.",
        "Order update failed",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleUrgentOrderSecondaryAction(order) {
    if (!order?.rawId) {
      return;
    }

    navigate(`/orders/${order.rawId}`);
  }

  function handleDateFilterChange(option, start, end) {
    setDateFilter(option);
    setStartDate(start);
    setEndDate(end);
  }

  return {
    chartSubtitle: dashboard.chartSubtitle,
    chartValues: dashboard.chartValues,
    chartYAxisLabels: dashboard.chartYAxisLabels,
    dateFilter,
    dashboardKitchenStatus,
    dashboardQuickActions,
    handleDateFilterChange,
    handleUrgentOrderPrimaryAction,
    handleUrgentOrderSecondaryAction,
    isLoading,
    isRefreshing,
    overviewCards: dashboard.overviewCards,
    businessProfilePrompt,
    reviews: dashboard.reviews,
    startDate,
    urgentOrders: dashboard.urgentOrders,
    urgentOrdersCount: dashboard.urgentOrdersCount,
    welcomeName: dashboard.welcomeName,
    endDate,
  };
}
