import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  { labelKey: "dashboard.actions.addMenu", icon: "plus", path: "/menu/create" },
  { labelKey: "dashboard.actions.pendingOrders", icon: "calendar", path: "/orders?tab=Pending" },
  { labelKey: "dashboard.actions.availability", icon: "alert", path: "/delivery" },
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

function buildBusinessProfilePrompt(settings, t) {
  if (!settings) {
    return {
      isVisible: false,
      missingCount: 0,
      missingLabels: [],
    };
  }

  const missingLabels = BUSINESS_PROFILE_CHECKS.filter(
    (item) => !normalizeString(settings[item.key]),
  ).map((item) => t(`dashboard.profile.${item.key === "phoneNumber" ? "phone" : item.key === "businessAddress" ? "address" : item.key === "businessType" ? "type" : item.key === "cuisineType" ? "cuisine" : item.key === "businessDescription" ? "description" : item.key}`));

  if (!settings.profileImage?.fileUrl) {
    missingLabels.push(t("dashboard.profile.logo"));
  }

  if (!settings.bannerImage?.fileUrl) {
    missingLabels.push(t("dashboard.profile.cover"));
  }

  return {
    isVisible: missingLabels.length > 0,
    missingCount: missingLabels.length,
    missingLabels,
  };
}

function buildNewOrderRequests(rows = [], t) {
  return rows
    .filter((row) => row?.status === "New")
    .map((row) => ({
      rawId: row.rawId,
      rawStatus: "NEW",
      id: row.displayId || `#${row.id}`,
      title: row.event || t("dashboard.orders.order"),
      amount: row.total || "NOK 0.00",
      statusLabel: t("dashboard.orders.new"),
      guests: t("dashboard.orders.guests", { count: Number(row.guests || 0) }),
      timing: `${row.date || t("dashboard.orders.deliveryPending")} ${row.time ? `kl. ${row.time}` : ""}`.trim(),
      address: t("dashboard.orders.customer", { name: row.customer || t("dashboard.orders.unavailableCustomer") }),
      tone: "is-warning",
    }));
}

export default function useDashboardPageState() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
    () => buildCustomDateLabel(startDate, endDate, i18n.language),
    [endDate, i18n.language, startDate],
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
        const newOrderRequests = buildNewOrderRequests(mappedOrders.rows, t);

        setDashboard(
          {
            ...mapDashboardResponse(result, {
              dateFilterLabel:
                dateFilter === "Last 2 Days"
                  ? t("dashboard.date.last2")
                  : dateFilter === "Custom Date"
                    ? t("dashboard.date.custom")
                    : t("dashboard.date.last7"),
              customDateLabel,
              kitchenSummary,
              totalOrdersOverride: mappedOrders.totalCount || kitchenSummary.total || 0,
              t,
              locale: i18n.language,
            }),
            urgentOrders: newOrderRequests,
            urgentOrdersCount: newOrderRequests.length,
          },
        );

        const mappedSettingsPage = mapVendorSettingsPage(settingsResult);
        setBusinessProfilePrompt(buildBusinessProfilePrompt(mappedSettingsPage.settings, t));
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || t("dashboard.chart.noDataMessage"),
            t("dashboard.title"),
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
  }, [customDateLabel, dateFilter, i18n.language, queryVariables, t]);

  const dashboardQuickActions = useMemo(
    () =>
      quickActions.map((action) => ({
        ...action,
        onClick: () => navigate(action.path),
      })),
    [navigate],
  );

  const dashboardKitchenStatus = useMemo(
    () =>
      dashboard.kitchenStatus.map((item) => ({
        ...item,
        onClick: () => navigate(`/orders?filter=${encodeURIComponent(item.filter)}`),
        goToOrders: () => navigate("/orders"),
      })),
    [dashboard.kitchenStatus, navigate],
  );

  async function handleNewOrderAccept(order) {
    const result = await confirmOrderStatusAction(t("dashboard.orders.accept"), order.id);

    if (!result.isConfirmed || !order?.rawId) {
      return;
    }

    try {
      setIsRefreshing(true);
      await updateVendorOrderStatus({
        id: order.rawId,
        status: "Accepted",
      });

      setDashboard((current) => ({
        ...current,
        urgentOrders: current.urgentOrders.filter((item) => item.rawId !== order.rawId),
        urgentOrdersCount: Math.max(0, current.urgentOrdersCount - 1),
      }));

      await showOrderStatusUpdated(`${order.id} ${t("dashboard.orders.accept").toLowerCase()}.`);
      navigate(`/orders/${order.rawId}`);
    } catch (error) {
      await showVendorErrorAlert(
        error.message || t("dashboard.orders.requiresAttention"),
        t("dashboard.orders.order"),
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleNewOrderReject(order) {
    const result = await confirmOrderStatusAction(t("dashboard.orders.reject"), order.id);

    if (!result.isConfirmed || !order?.rawId) {
      return;
    }

    try {
      setIsRefreshing(true);
      await updateVendorOrderStatus({ id: order.rawId, status: "Canceled" });
      setDashboard((current) => ({
        ...current,
        urgentOrders: current.urgentOrders.filter((item) => item.rawId !== order.rawId),
        urgentOrdersCount: Math.max(0, current.urgentOrdersCount - 1),
      }));
      await showOrderStatusUpdated(`${order.id} ${t("dashboard.orders.reject").toLowerCase()}.`);
    } catch (error) {
      await showVendorErrorAlert(
        error.message || t("dashboard.orders.requiresAttention"),
        t("dashboard.orders.order"),
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleNewOrderViewDetails(order) {
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
    handleNewOrderAccept,
    handleNewOrderReject,
    handleNewOrderViewDetails,
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
