function normalizeString(value) {
  return value == null ? "" : String(value);
}

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function formatCurrency(value, currency = "NOK") {
  const amount = toNumber(value);
  const normalizedCurrency = normalizeString(currency).trim().toUpperCase();
  const prefix = normalizedCurrency === "NOK" ? "kr" : normalizedCurrency || "kr";
  return `${prefix} ${amount.toFixed(2)}`;
}

function formatAxisCurrency(value, currency = "NOK") {
  const amount = toNumber(value);
  const normalizedCurrency = normalizeString(currency).trim().toUpperCase();
  const prefix = normalizedCurrency === "NOK" ? "kr" : normalizedCurrency || "kr";
  return `${prefix} ${Math.round(amount)}`;
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return normalizeString(dateValue);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTimeValue(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return normalizeString(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTrendValue(value) {
  const amount = toNumber(value);
  return `${Math.abs(amount).toFixed(1)}%`;
}

function mapTrendDirection(value) {
  const amount = toNumber(value);

  if (amount > 0) {
    return "up";
  }

  if (amount < 0) {
    return "down";
  }

  return "none";
}

function shouldShowTrend(value, trendValue, timeLabel) {
  const numericValue = toNumber(value);
  const numericTrend = toNumber(trendValue);
  const normalizedTimeLabel = normalizeString(timeLabel).trim();

  if (!normalizedTimeLabel) {
    return false;
  }

  if (numericValue <= 0) {
    return false;
  }

  return numericTrend !== 0;
}

function buildTrendMeta(value, trendValue, timeLabel) {
  if (!shouldShowTrend(value, trendValue, timeLabel)) {
    return {
      trend: null,
      trendValue: "",
      timeLabel: "",
    };
  }

  return {
    trend: mapTrendDirection(trendValue),
    trendValue: formatTrendValue(trendValue),
    timeLabel: normalizeString(timeLabel),
  };
}

function buildCapacityHelper(capacityPercent) {
  if (capacityPercent >= 75) {
    return "High - plan your schedule";
  }

  if (capacityPercent >= 40) {
    return "Moderate demand";
  }

  return "Low demand";
}

function formatDeliveryWindow(windowValue, deliveryDate) {
  if (windowValue && typeof windowValue === "object") {
    const label = normalizeString(windowValue.label).trim();
    const start = normalizeString(windowValue.start).trim();
    const end = normalizeString(windowValue.end).trim();
    const date = normalizeString(windowValue.date).trim() || normalizeString(deliveryDate).trim();

    if (label) {
      return label;
    }

    if (start && end) {
      return `${start} - ${end}`;
    }

    if (date) {
      return formatDateLabel(date);
    }
  }

  return normalizeString(deliveryDate).trim() ? formatDateLabel(deliveryDate) : "--";
}

function mapUrgentOrderTone(deliveryDate) {
  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dueDate = new Date(deliveryDate);

  if (Number.isNaN(dueDate.getTime())) {
    return "is-danger";
  }

  const normalizedDueDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  );

  return normalizedDueDate < currentDate ? "is-danger" : "is-warning";
}

export function createEmptyDashboardState() {
  return {
    welcomeName: "",
    overviewCards: [],
    urgentOrders: [],
    urgentOrdersCount: 0,
    kitchenStatus: [],
    chartValues: [],
    chartYAxisLabels: [],
    chartSubtitle: "",
    reviews: [],
  };
}

export function buildKitchenStatusFromSummary(summary = {}) {
  return [
    {
      value: String(toNumber(summary?.preparing)),
      label: "Preparing",
      sublabel: "Orders",
      tone: "is-blue",
      icon: "chef",
    },
    {
      value: String(toNumber(summary?.ready)),
      label: "Ready",
      sublabel: "Orders",
      tone: "is-green",
      icon: "check",
    },
    {
      value: String(toNumber(summary?.outForDelivery ?? summary?.out_for_delivery)),
      label: "Out for Delivery",
      sublabel: "Orders",
      tone: "is-amber",
      icon: "delivery",
    },
  ];
}

export function mapDashboardResponse(
  data,
  { dateFilterLabel, customDateLabel, kitchenSummary, totalOrdersOverride } = {},
) {
  const me = data?.me || null;
  const summary = data?.vendorDashboardSummary || {};
  const currency = normalizeString(summary.currency || "NOK");
  const capacityPercent = Math.max(0, Math.round(toNumber(summary.capacityPercent)));
  const chartPoints = Array.isArray(data?.vendorFinanceOverviewChart?.points)
    ? data.vendorFinanceOverviewChart.points
    : [];
  const maxChartValue = chartPoints.reduce(
    (highest, point) => Math.max(highest, toNumber(point?.earnings)),
    0,
  );
  const totalOrders = Math.max(
    toNumber(summary.totalOrders),
    toNumber(totalOrdersOverride),
  );
  const upcomingOrders = toNumber(summary.upcomingOrders);
  const urgentOrdersCount = toNumber(summary.urgentOrders);
  const totalOrdersTrendMeta = buildTrendMeta(
    totalOrders,
    summary.totalOrdersTrend,
    summary.totalOrdersTimeLabel,
  );
  const upcomingOrdersTrendMeta = buildTrendMeta(
    upcomingOrders,
    summary.upcomingOrdersTrend,
    summary.upcomingOrdersTimeLabel,
  );
  const urgentOrdersTrendMeta = buildTrendMeta(
    urgentOrdersCount,
    summary.urgentOrdersTrend,
    summary.urgentOrdersTimeLabel,
  );
  const capacityTrendMeta = buildTrendMeta(
    capacityPercent,
    summary.capacityTrend,
    summary.capacityTimeLabel,
  );

  const overviewCards = [
    {
      label: "Total Orders",
      value: String(totalOrders),
      helper: "Orders in selected range",
      helperTone: totalOrdersTrendMeta.trend === "up" ? "is-positive" : "",
      icon: "calendar",
      trend: totalOrdersTrendMeta.trend,
      trendValue: totalOrdersTrendMeta.trendValue,
      timeLabel: totalOrdersTrendMeta.timeLabel,
    },
    {
      label: "Upcoming (Next 4 hrs)",
      value: String(upcomingOrders),
      helper: "Scheduled soon",
      icon: "clipboard",
      trend: upcomingOrdersTrendMeta.trend,
      trendValue: upcomingOrdersTrendMeta.trendValue,
      timeLabel: upcomingOrdersTrendMeta.timeLabel,
    },
    {
      label: "Urgent Orders",
      value: String(urgentOrdersCount),
      helper: "Require attention",
      icon: "alert",
      trend: urgentOrdersTrendMeta.trend,
      trendValue: urgentOrdersTrendMeta.trendValue,
      timeLabel: urgentOrdersTrendMeta.timeLabel,
    },
    {
      label: "Capacity Utilization",
      value: `${capacityPercent}%`,
      helper: buildCapacityHelper(capacityPercent),
      icon: "gauge",
      variant: "capacity",
      progress: capacityPercent,
      trend: capacityTrendMeta.trend,
      trendValue: capacityTrendMeta.trendValue,
      timeLabel: capacityTrendMeta.timeLabel,
    },
  ];

  const urgentOrderEdges = Array.isArray(data?.vendorUrgentOrders?.edges)
    ? data.vendorUrgentOrders.edges
    : [];

  const urgentOrders = urgentOrderEdges
    .map((edge) => edge?.node)
    .filter(Boolean)
    .map((node) => {
      const displayCustomer =
        normalizeString(node?.customerInfo?.fullName).trim() ||
        normalizeString(node?.customerName).trim() ||
        "Customer unavailable";

      return {
        rawId: normalizeString(node.id),
        id: `#${normalizeString(node.orderNumber || node.id)}`,
        title: normalizeString(node.eventName) || "Order",
        amount: formatCurrency(node.finalPrice, currency),
        statusLabel: normalizeString(node.statusLabel || node.status) || "Urgent",
        guests: `${toNumber(node.guestCount)} guests`,
        timing: formatDeliveryWindow(node.deliveryWindow, node.deliveryDate),
        address: `Customer: ${displayCustomer}`,
        tone: mapUrgentOrderTone(node.deliveryDate),
      };
    });

  const dashboardKitchenSummary =
    kitchenSummary ||
    (data?.vendorOrderSummaryAllTime && typeof data.vendorOrderSummaryAllTime === "object"
      ? data.vendorOrderSummaryAllTime
      : null) ||
    {};
  const kitchenStatus = buildKitchenStatusFromSummary(dashboardKitchenSummary);

  const chartValues = chartPoints.map((point) => ({
    month: normalizeString(point?.label) || "--",
    value: maxChartValue > 0 ? Math.max(6, Math.round((toNumber(point?.earnings) / maxChartValue) * 100)) : 0,
  }));

  const chartYAxisLabels =
    maxChartValue > 0
      ? [1, 0.75, 0.5, 0.25, 0].map((ratio) => formatAxisCurrency(maxChartValue * ratio, currency))
      : [];

  const reviewEdges = Array.isArray(data?.vendorReviews?.edges) ? data.vendorReviews.edges : [];
  const reviews = reviewEdges
    .map((edge) => edge?.node)
    .filter(Boolean)
    .map((node) => ({
      name: normalizeString(node?.customer?.fullName) || "Anonymous Customer",
      rating: String(toNumber(node?.rating)),
      time: normalizeString(node?.ageLabel) || formatDateTimeValue(node?.createdOn),
      summary: normalizeString(node?.comment) || normalizeString(node?.title) || "No review text provided.",
      id: `#REV-${normalizeString(node?.id)}`,
    }));

  const subtitleLabel =
    dateFilterLabel === "Custom Date" && customDateLabel
      ? `Revenue performance from ${customDateLabel}`
      : `Revenue performance over the ${normalizeString(dateFilterLabel).toLowerCase()}`;

  return {
    welcomeName:
      normalizeString(me?.firstName).trim() ||
      normalizeString(me?.lastName).trim() ||
      normalizeString(me?.email).trim(),
    overviewCards,
    urgentOrders,
    urgentOrdersCount: toNumber(data?.vendorUrgentOrders?.totalCount, urgentOrders.length),
    kitchenStatus,
    chartValues,
    chartYAxisLabels,
    chartSubtitle: subtitleLabel,
    reviews,
  };
}

function formatAsIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function buildDashboardQueryVariables({ dateFilter, startDate, endDate }) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let summaryPreset = null;
  let urgentPreset = null;
  let reviewsPreset = null;
  let dateFrom = null;
  let dateTo = null;

  if (dateFilter === "Last 2 Days") {
    const start = new Date(end);
    start.setDate(end.getDate() - 1);
    dateFrom = formatAsIsoDate(start);
    dateTo = formatAsIsoDate(end);
  } else if (dateFilter === "Last 7 Days") {
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    summaryPreset = "last-7-days";
    urgentPreset = "this_week";
    reviewsPreset = "lastMonth";
    dateFrom = formatAsIsoDate(start);
    dateTo = formatAsIsoDate(end);
  } else if (dateFilter === "Custom Date" && startDate && endDate) {
    dateFrom = startDate;
    dateTo = endDate;
  }

  const daySpan =
    dateFrom && dateTo
      ? Math.max(
          1,
          Math.round(
            (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24),
          ) + 1,
        )
      : 7;

  return {
    summaryPreset,
    urgentPreset,
    reviewsPreset,
    dateFrom,
    dateTo,
    urgentFirst: 5,
    reviewsFirst: 5,
    chartGroupBy: daySpan > 31 ? "week" : "day",
  };
}

export function buildCustomDateLabel(startDate, endDate) {
  if (!startDate || !endDate) {
    return "";
  }

  return `${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}`;
}
