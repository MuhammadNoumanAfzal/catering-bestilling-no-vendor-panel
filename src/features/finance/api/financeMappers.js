function normalizeString(value) {
  return value == null ? "" : String(value);
}

function parseNumber(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
}

function formatCurrency(value, currency = "kr") {
  const amount = parseNumber(value);
  return `${currency} ${amount.toFixed(2)}`;
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return normalizeString(dateValue);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizePayoutStatus(value) {
  const normalized = normalizeString(value).trim().toUpperCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "PAYOUT_PAID":
    case "PAID":
    case "SETTLED":
    case "COMPLETED":
      return "PAID";
    case "PAYOUT_RELEASED":
    case "RELEASED":
    case "INCLUDED_IN_PAYOUT":
      return "RELEASED";
    case "PAYOUT_PENDING":
    case "PENDING":
    case "READY_FOR_PAYOUT":
    case "FUNDED":
      return "PENDING";
    default:
      return normalized;
  }
}

function hasValidDate(value) {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function resolvePayoutLifecycleStatus(item) {
  if (!item) {
    return "PENDING";
  }

  if (hasValidDate(item?.paidAt)) {
    return "PAID";
  }

  if (hasValidDate(item?.releasedAt)) {
    return "RELEASED";
  }

  const normalized = normalizePayoutStatus(item?.status);

  if (normalized === "PAID" && !hasValidDate(item?.paidAt)) {
    return hasValidDate(item?.releasedAt) ? "RELEASED" : "PENDING";
  }

  return normalized || "PENDING";
}

function sumMoney(items, field) {
  return items.reduce((sum, item) => sum + parseNumber(item?.[field]?.amount), 0);
}

function getMoneyCurrency(items, field, fallback = "NOK") {
  return (
    items.find((item) => normalizeString(item?.[field]?.currency))?.[field]?.currency ||
    fallback
  );
}

export function mapFinanceSummaryCards(data, payoutsData = null) {
  const summary = data?.vendorFinanceSummary;
  const payoutEdges = Array.isArray(payoutsData?.vendorPayouts?.edges)
    ? payoutsData.vendorPayouts.edges
    : [];
  const payouts = payoutEdges.map((edge) => edge?.node).filter(Boolean);
  const paidPayouts = payouts.filter((item) => resolvePayoutLifecycleStatus(item) === "PAID");
  const paidCommissionTotal = sumMoney(paidPayouts, "commissionAmount");
  const paidCommissionCurrency = getMoneyCurrency(paidPayouts, "commissionAmount", summary?.commissionPaid?.currency || "NOK");
  const completedPayoutTotal = sumMoney(paidPayouts, "netAmount");
  const completedPayoutCurrency = getMoneyCurrency(paidPayouts, "netAmount", summary?.completedPayouts?.currency || "NOK");

  const commissionPaidValue =
    parseNumber(summary?.commissionPaid?.amount) > 0
      ? summary?.commissionPaid?.formatted || formatCurrency(summary?.commissionPaid?.amount, summary?.commissionPaid?.currency || "NOK")
      : paidCommissionTotal > 0
        ? formatCurrency(paidCommissionTotal, paidCommissionCurrency)
        : summary?.commissionPaid?.formatted || formatCurrency(summary?.commissionPaid?.amount, summary?.commissionPaid?.currency || "NOK");

  const completedPayoutsValue =
    parseNumber(summary?.completedPayouts?.amount) > 0
      ? summary?.completedPayouts?.formatted || formatCurrency(summary?.completedPayouts?.amount, summary?.completedPayouts?.currency || "NOK")
      : completedPayoutTotal > 0
        ? formatCurrency(completedPayoutTotal, completedPayoutCurrency)
        : summary?.completedPayouts?.formatted || formatCurrency(summary?.completedPayouts?.amount, summary?.completedPayouts?.currency || "NOK");

  return [
    {
      label: "Total Revenue",
      value: summary?.totalRevenue?.formatted || formatCurrency(summary?.totalRevenue?.amount, summary?.totalRevenue?.currency || "NOK"),
      accent: "#ffefe7",
      icon: "camera",
    },
    {
      label: "Pending Payout",
      value: summary?.pendingPayout?.formatted || formatCurrency(summary?.pendingPayout?.amount, summary?.pendingPayout?.currency || "NOK"),
      accent: "#fff2ec",
      icon: "wallet",
    },
    {
      label: "Completed Payouts",
      value: completedPayoutsValue,
      accent: "#fff2ec",
      icon: "close",
    },
    {
      label: "Commission Paid",
      value: commissionPaidValue,
      accent: "#fff2ec",
      icon: "clock",
    },
  ];
}

export function mapFinanceChartPoints(data) {
  const points = Array.isArray(data?.vendorFinanceOverviewChart?.points)
    ? data.vendorFinanceOverviewChart.points
    : [];

  return points.map((point) => ({
    label: normalizeString(point?.label),
    earnings: parseNumber(point?.earnings),
    orders: parseNumber(point?.orders),
  }));
}

export function mapPayoutStatusItems(data) {
  const connection = data?.vendorPayouts || {};
  const edges = Array.isArray(connection?.edges) ? connection.edges : [];
  const payouts = edges.map((edge) => edge?.node).filter(Boolean);

  const pending = payouts.filter((item) => resolvePayoutLifecycleStatus(item) === "PENDING");
  const released = payouts.filter((item) => resolvePayoutLifecycleStatus(item) === "RELEASED");
  const paid = payouts.filter((item) => resolvePayoutLifecycleStatus(item) === "PAID");
  const latestPaid = [...paid].sort((left, right) => {
    const leftTime = new Date(left?.paidAt || left?.createdAt || 0).getTime();
    const rightTime = new Date(right?.paidAt || right?.createdAt || 0).getTime();
    return rightTime - leftTime;
  })[0];

  const pendingCurrency = pending[0]?.netAmount?.currency || payouts[0]?.netAmount?.currency || "NOK";
  const releasedCurrency = released[0]?.netAmount?.currency || pendingCurrency;
  const paidCurrency = paid[0]?.netAmount?.currency || releasedCurrency;

  return [
    {
      title: "Pending Payouts",
      description: `${pending.length} payout${pending.length === 1 ? "" : "s"} waiting for release`,
      amount: formatCurrency(sumMoney(pending, "netAmount"), pendingCurrency),
      tone: "orange",
    },
    {
      title: "Released Payouts",
      description: `${released.length} payout${released.length === 1 ? "" : "s"} released by admin`,
      amount: formatCurrency(sumMoney(released, "netAmount"), releasedCurrency),
      tone: "green",
    },
    paid.length
      ? {
          title: "Paid Payouts",
          description: latestPaid?.payoutReference
            ? `${paid.length} payout${paid.length === 1 ? "" : "s"} completed · Latest ref ${latestPaid.payoutReference}`
            : `${paid.length} payout${paid.length === 1 ? "" : "s"} completed`,
          amount: formatCurrency(sumMoney(paid, "netAmount"), paidCurrency),
          tone: "blue",
        }
      : null,
  ].filter(Boolean);
}

export function mapTransactionsConnection(data) {
  const connection = data?.vendorInvoices;
  const edges = Array.isArray(connection?.edges) ? connection.edges : [];

  return {
    rows: edges
      .map((edge) => edge?.node)
      .filter(Boolean)
      .map((node) => {
        return {
          id: normalizeString(node.id),
          invoiceNumber: normalizeString(node.invoiceNumber || `INV-${node.id}`),
          orderId: normalizeString(node.id),
          customerName: normalizeString(node.customerName),
          eventDate: formatDateLabel(node.deliveryDate),
          eventDateRaw: normalizeString(node.deliveryDate),
          grossAmount: formatCurrency(node.finalPrice, "NOK"),
          paymentStatus: normalizeString(node.paymentStatus || "PENDING"),
          paymentStatusLabel: "Customer invoice status",
          paymentMethod: normalizeString(node.paymentMethod || "Not specified"),
        };
      }),
    totalCount: parseNumber(connection?.totalCount),
    pageInfo: {
      hasNextPage: Boolean(connection?.pageInfo?.hasNextPage),
      hasPreviousPage: Boolean(connection?.pageInfo?.hasPreviousPage),
      startCursor: normalizeString(connection?.pageInfo?.startCursor),
      endCursor: normalizeString(connection?.pageInfo?.endCursor),
    },
  };
}

export function mapTransactionDetail(node) {
  if (!node) {
    return null;
  }

  return {
    id: normalizeString(node.id),
    invoiceNumber: normalizeString(node.invoiceNumber || `INV-${node.id}`),
    orderId: normalizeString(node.id),
    customerName: normalizeString(node.customerName),
    eventDate: formatDateLabel(node.deliveryDate || node.eventDate),
    grossAmount: formatCurrency(node.finalPrice, "NOK"),
    paymentStatus: normalizeString(node.paymentStatus || "PENDING"),
    paymentStatusLabel: "Customer invoice status",
    paymentMethod: normalizeString(node.paymentMethod || "Not specified"),
  };
}

function toYmd(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDateAtStartOfDay(baseDate = new Date()) {
  const nextDate = new Date(baseDate);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getRangeLengthInDays(customFrom, customTo) {
  const fromDate = createDateAtStartOfDay(new Date(customFrom));
  const toDate = createDateAtStartOfDay(new Date(customTo));

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return null;
  }

  const differenceInMilliseconds = toDate.getTime() - fromDate.getTime();

  if (differenceInMilliseconds < 0) {
    return null;
  }

  return Math.floor(differenceInMilliseconds / 86400000) + 1;
}

export function getFinanceDateRangeVariables({ rangePreset, customFrom, customTo }) {
  if (rangePreset === "custom" && customFrom && customTo) {
    return {
      dateFrom: customFrom,
      dateTo: customTo,
    };
  }

  const today = createDateAtStartOfDay(new Date());
  const dateTo = toYmd(today);
  const dateFromDate = new Date(today);

  switch (rangePreset) {
    case "7days":
      dateFromDate.setDate(today.getDate() - 6);
      break;
    case "30days":
      dateFromDate.setDate(today.getDate() - 29);
      break;
    case "thisMonth":
      dateFromDate.setDate(1);
      break;
    case "lastMonth":
      dateFromDate.setMonth(today.getMonth() - 1, 1);
      today.setDate(0);
      return {
        dateFrom: toYmd(dateFromDate),
        dateTo: toYmd(today),
      };
    case "thisYear":
      dateFromDate.setMonth(0, 1);
      break;
    default:
      dateFromDate.setDate(today.getDate() - 29);
      break;
  }

  return {
    dateFrom: toYmd(dateFromDate),
    dateTo,
  };
}

export function getFinanceSummaryVariables({ rangePreset, customFrom, customTo }) {
  if (rangePreset === "custom" && customFrom && customTo) {
    return {
      rangePreset,
      dateFrom: customFrom,
      dateTo: customTo,
    };
  }

  return {
    rangePreset,
  };
}

export function getChartGroupBy(rangePreset, customFrom, customTo) {
  if (rangePreset === "custom") {
    const rangeLength = getRangeLengthInDays(customFrom, customTo);

    if (rangeLength == null || rangeLength <= 31) {
      return "day";
    }

    if (rangeLength <= 120) {
      return "week";
    }

    return "month";
  }

  if (rangePreset === "7days" || rangePreset === "30days") {
    return "day";
  }

  if (rangePreset === "thisMonth" || rangePreset === "lastMonth") {
    return "week";
  }

  return "month";
}
