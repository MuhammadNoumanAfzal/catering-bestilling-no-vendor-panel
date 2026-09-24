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
import { getVendorOrdersPage, updateVendorOrderStatus } from "../../order/api/orderApi";
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
      timing: `${row.date || t("dashboard.orders.deliveryPending")} ${row.time ? `${t("dashboard.orders.timePrefix", { defaultValue: "at" })} ${row.time}` : ""}`.trim(),
      address: t("dashboard.orders.customer", { name: row.customer || t("dashboard.orders.unavailableCustomer") }),
      tone: "is-warning",
    }));
}

function getOrderDateValue(row) {
  const raw = row?.raw || {};
  return raw.eventDate || raw.deliveryDate || raw.placedAt || raw.createdOn || row?.date || "";
}

function startOfDay(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getLatestOrderDate(rows = []) {
  return rows.reduce((latest, row) => {
    const rowDate = startOfDay(getOrderDateValue(row));

    if (!rowDate) {
      return latest;
    }

    return !latest || rowDate > latest ? rowDate : latest;
  }, null);
}

function buildDashboardLocalRange(rows = [], dateFilter, startDate, endDate) {
  if (!dateFilter || dateFilter === "All Time") {
    return { from: null, to: null };
  }

  if (dateFilter === "Custom Date") {
    return {
      from: startDate ? new Date(`${startDate}T00:00:00`) : null,
      to: endDate ? new Date(`${endDate}T23:59:59`) : null,
    };
  }

  const latest = getLatestOrderDate(rows) || startOfDay(new Date());
  const to = new Date(latest);
  to.setHours(23, 59, 59, 999);
  const from = new Date(latest);

  if (dateFilter === "Last 2 Days") {
    from.setDate(from.getDate() - 1);
  } else if (dateFilter === "Last 7 Days") {
    from.setDate(from.getDate() - 6);
  } else if (dateFilter === "Last Month") {
    from.setDate(from.getDate() - 29);
  } else if (dateFilter === "Last 3 Months") {
    from.setDate(from.getDate() - 89);
  } else if (dateFilter === "Last 6 Months") {
    from.setDate(from.getDate() - 179);
  } else if (dateFilter === "This Year") {
    from.setMonth(0, 1);
  } else {
    return { from: null, to: null };
  }

  from.setHours(0, 0, 0, 0);
  return { from, to };
}

function filterRowsByDashboardRange(rows = [], dateFilter, startDate, endDate) {
  const { from, to } = buildDashboardLocalRange(rows, dateFilter, startDate, endDate);

  if (!from && !to) {
    return rows;
  }

  return rows.filter((row) => {
    const rowDate = startOfDay(getOrderDateValue(row));

    if (!rowDate) {
      return false;
    }

    if (from && rowDate < from) {
      return false;
    }

    if (to && rowDate > to) {
      return false;
    }

    return true;
  });
}

function countUpcomingOrders(rows = [], hours = 4) {
  const now = new Date();
  const end = new Date(now.getTime() + hours * 60 * 60 * 1000);

  return rows.filter((row) => {
    const raw = row?.raw || {};
    const dateValue = raw.eventDate || raw.deliveryDate;
    const timeValue = raw.eventTime || raw.deliveryWindow?.start || row?.time || "";
    const candidate = new Date(`${dateValue || ""}T${timeValue || "00:00"}`);

    return !Number.isNaN(candidate.getTime()) && candidate >= now && candidate <= end;
  }).length;
}

function buildSummaryFromFilteredRows(rows = []) {
  const base = mapVendorOrderSummary(null, rows);
  const urgentOrders = rows.filter((row) => ["New", "Pending", "Placed"].includes(row.status)).length;

  return {
    ...base,
    totalOrders: rows.length,
    upcomingOrders: countUpcomingOrders(rows),
    urgentOrders,
  };
}
function getDashboardDateFilterLabel(dateFilter, t) {
  const labels = {
    "All Time": t("dashboard.date.allTime", { defaultValue: "All time" }),
    "Last 2 Days": t("dashboard.date.last2"),
    "Last 7 Days": t("dashboard.date.last7"),
    "Last Month": t("dashboard.date.lastMonth", { defaultValue: "Last Month" }),
    "Last 3 Months": t("dashboard.date.last3Months", { defaultValue: "Last 3 Months" }),
    "Last 6 Months": t("dashboard.date.last6Months", { defaultValue: "Last 6 Months" }),
    "This Year": t("dashboard.date.thisYear", { defaultValue: "This Year" }),
    "Custom Date": t("dashboard.date.custom"),
  };

  return labels[dateFilter] || labels["Last 7 Days"];
}
function buildOrderChartFallback(rows = [], locale = "nb-NO") {
  const totalsByDate = new Map();

  rows.forEach((row) => {
    const raw = row?.raw || {};
    const status = `${row?.status || ""}`.trim().toLowerCase();
    const dateValue = raw.eventDate || raw.deliveryDate || raw.createdOn;
    const date = new Date(dateValue);

    if (status === "canceled" || Number.isNaN(date.getTime())) {
      return;
    }

    const amount = Number(raw?.pricing?.grandTotal ?? raw?.finalPrice ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const key = date.toISOString().slice(0, 10);
    totalsByDate.set(key, (totalsByDate.get(key) || 0) + amount);
  });

  return [...totalsByDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, earnings]) => ({
      label: new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
      }),
      earnings,
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
          // A single page keeps the dashboard responsive while providing a
          // reliable fallback when the dashboard summary has stale zero values.
          getVendorOrdersPage(),
          getVendorSettingsPage(),
        ]);

        if (isCancelled) {
          return;
        }

        const mappedOrders = mapVendorOrdersResult(ordersResult);
        const filteredOrderRows = filterRowsByDashboardRange(mappedOrders.rows, dateFilter, startDate, endDate);
        const ordersSummary = buildSummaryFromFilteredRows(filteredOrderRows);
        const newOrderRequests = buildNewOrderRequests(filteredOrderRows, t);
        const backendChartPoints = result?.vendorFinanceOverviewChart?.points;
        const fallbackChartPoints = buildOrderChartFallback(filteredOrderRows, i18n.language);
        const chartPoints = fallbackChartPoints.length
          ? fallbackChartPoints
          : Array.isArray(backendChartPoints)
            ? backendChartPoints
            : [];
        const dashboardResult = {
          ...result,
          vendorDashboardSummary: {
            ...(result?.vendorDashboardSummary || {}),
            ...ordersSummary,
          },
          vendorFinanceOverviewChart: { points: chartPoints },
        };

        setDashboard({
          ...mapDashboardResponse(dashboardResult, {
            dateFilterLabel: getDashboardDateFilterLabel(dateFilter, t),
            customDateLabel,
            kitchenSummary:
              ordersSummary ||
              result?.vendorKitchenStatus ||
              result?.vendorOrderSummaryAllTime ||
              result?.vendorOrderSummary,
            totalOrdersOverride: ordersSummary.totalOrders ?? filteredOrderRows.length,
            t,
            locale: i18n.language,
          }),
          urgentOrders: newOrderRequests,
          urgentOrdersCount: newOrderRequests.length,
        });

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
    const result = await confirmOrderStatusAction(t("dashboard.orders.accept"), order.id, {
      text: t("dashboard.orders.confirmApplyToOrder", { action: t("dashboard.orders.accept"), orderId: order.id }),
      cancelButtonText: t("dashboard.orders.notNow"),
    });

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

      await showOrderStatusUpdated(t("dashboard.orders.acceptedToast", { id: order.id, defaultValue: `${order.id} accepted.` }));
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
    const result = await confirmOrderStatusAction(t("dashboard.orders.reject"), order.id, {
      text: t("dashboard.orders.confirmApplyToOrder", { action: t("dashboard.orders.reject"), orderId: order.id }),
      cancelButtonText: t("dashboard.orders.notNow"),
    });

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
      await showOrderStatusUpdated(t("dashboard.orders.rejectedToast", { id: order.id, defaultValue: `${order.id} rejected.` }));
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
    identityVerification: dashboard.identityVerification,
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
