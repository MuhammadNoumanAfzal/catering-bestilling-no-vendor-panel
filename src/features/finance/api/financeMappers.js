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

export function mapFinanceSummaryCards(data) {
  const summary = data?.vendorFinanceSummary;
  const currency = normalizeString(summary?.currency || "kr");

  return [
    {
      label: "Total Earnings",
      value: formatCurrency(summary?.totalEarnings, currency),
      accent: "#ffefe7",
      icon: "camera",
    },
    {
      label: "Net Income",
      value: formatCurrency(summary?.netIncome, currency),
      accent: "#fff2ec",
      icon: "wallet",
    },
    {
      label: "Platform Commission",
      value: formatCurrency(summary?.platformCommission, currency),
      accent: "#fff2ec",
      icon: "close",
    },
    {
      label: "Pending Payouts",
      value: formatCurrency(summary?.pendingPayouts, currency),
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
  const payoutStatus = data?.vendorPayoutStatus || {};

  return [
    payoutStatus.pendingPayout
      ? {
          title: payoutStatus.pendingPayout.title || "Pending Payout",
          description:
            payoutStatus.pendingPayout.description ||
            (payoutStatus.pendingPayout.expectedArrival
              ? `Expected arrival ${payoutStatus.pendingPayout.expectedArrival}`
              : ""),
          amount: formatCurrency(
            payoutStatus.pendingPayout.amount,
            payoutStatus.pendingPayout.currency,
          ),
          tone: "orange",
        }
      : null,
    payoutStatus.paidAmount
      ? {
          title: payoutStatus.paidAmount.title || "Paid Amount",
          description: payoutStatus.paidAmount.description || "",
          amount: formatCurrency(
            payoutStatus.paidAmount.amount,
            payoutStatus.paidAmount.currency,
          ),
          tone: "green",
        }
      : null,
    payoutStatus.lastPayout
      ? {
          title: payoutStatus.lastPayout.title || "Last Payout",
          description:
            payoutStatus.lastPayout.description ||
            (payoutStatus.lastPayout.status
              ? `Status: ${payoutStatus.lastPayout.status}`
              : ""),
          amount: payoutStatus.lastPayout.payoutDate
            ? formatDateLabel(payoutStatus.lastPayout.payoutDate)
            : formatCurrency(
                payoutStatus.lastPayout.amount,
                payoutStatus.lastPayout.currency,
              ),
          tone: "blue",
        }
      : null,
  ].filter(Boolean);
}

export function mapTransactionsConnection(data) {
  const connection = data?.vendorFinanceTransactions;
  const edges = Array.isArray(connection?.edges) ? connection.edges : [];

  return {
    rows: edges
      .map((edge) => edge?.node)
      .filter(Boolean)
      .map((node) => ({
        id: normalizeString(node.id),
        orderId: normalizeString(node.orderId),
        customerName: normalizeString(node.customerName),
        eventType: normalizeString(node.eventType),
        eventDate: normalizeString(node.eventDate),
        grossAmount: formatCurrency(node.grossAmount, node.currency),
        commissionAmount: `-${formatCurrency(node.commissionAmount, node.currency)}`,
        netAmount: formatCurrency(node.netAmount, node.currency),
        currency: normalizeString(node.currency),
        payoutStatus: normalizeString(node.payoutStatus),
        createdOn: normalizeString(node.createdOn),
      })),
    pageInfo: {
      hasNextPage: Boolean(connection?.pageInfo?.hasNextPage),
      endCursor: normalizeString(connection?.pageInfo?.endCursor),
    },
    totalCount: parseNumber(connection?.totalCount),
  };
}

export function mapTransactionDetail(node) {
  if (!node) {
    return null;
  }

  return {
    id: normalizeString(node.id),
    orderId: normalizeString(node.orderId),
    customerName: normalizeString(node.customerName),
    eventType: normalizeString(node.eventType),
    eventDate: normalizeString(node.eventDate),
    grossAmount: formatCurrency(node.grossAmount, node.currency),
    commissionAmount: `-${formatCurrency(node.commissionAmount, node.currency)}`,
    netAmount: formatCurrency(node.netAmount, node.currency),
    currency: normalizeString(node.currency),
    payoutStatus: normalizeString(node.payoutStatus),
    payoutDate: normalizeString(node.payoutDate),
    createdOn: normalizeString(node.createdOn),
    updatedOn: normalizeString(node.updatedOn),
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

export function getFinanceRangeVariables({ rangePreset, customFrom, customTo }) {
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

export function getChartGroupBy(rangePreset) {
  if (rangePreset === "7days" || rangePreset === "30days") {
    return "day";
  }

  if (rangePreset === "thisMonth" || rangePreset === "lastMonth") {
    return "week";
  }

  return "month";
}
