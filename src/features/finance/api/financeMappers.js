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

export function getFinanceRangeVariables({ rangePreset, customFrom, customTo }) {
  if (rangePreset === "custom" && customFrom && customTo) {
    return {
      rangePreset: "custom",
      dateFrom: customFrom,
      dateTo: customTo,
    };
  }

  return {
    rangePreset,
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
