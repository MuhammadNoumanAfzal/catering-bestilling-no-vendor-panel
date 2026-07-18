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

function normalizeLookupKey(value) {
  return normalizeString(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getTrailingDigits(value) {
  const match = normalizeString(value).match(/(\d+)\D*$/);
  return match ? match[1] : "";
}

function createLookupKeys(...values) {
  const keys = new Set();

  values.forEach((value) => {
    const normalized = normalizeString(value).trim();
    if (!normalized) {
      return;
    }

    const compactKey = normalizeLookupKey(normalized);
    if (compactKey) {
      keys.add(compactKey);
    }

    const trailingDigits = getTrailingDigits(normalized);
    if (trailingDigits) {
      keys.add(trailingDigits);
    }
  });

  return [...keys];
}

export function buildFinanceOrderTotalsLookup(ordersResult) {
  const connection = ordersResult?.orders || ordersResult?.vendorOrders;
  const edges = Array.isArray(connection?.edges) ? connection.edges : [];
  const lookup = new Map();

  edges
    .map((edge) => edge?.node)
    .filter(Boolean)
    .forEach((node) => {
      const grandTotal = parseNumber(node?.pricing?.grandTotal ?? node?.finalPrice);
      const currency = normalizeString(node?.currency || "NOK");

      if (grandTotal <= 0) {
        return;
      }

      createLookupKeys(node?.id, node?.invoiceNumber, node?.orderNumber).forEach((key) => {
        lookup.set(key, {
          grandTotal,
          currency,
        });
      });
    });

  return lookup;
}

function resolveTransactionAmounts(node, orderTotalsLookup) {
  const grossAmount = parseNumber(node?.grossAmount);
  const commissionAmount = parseNumber(node?.commissionAmount);
  const netAmount = parseNumber(node?.netAmount);

  if (!(orderTotalsLookup instanceof Map) || orderTotalsLookup.size === 0) {
    return {
      grossAmount,
      commissionAmount,
      netAmount,
      currency: normalizeString(node?.currency),
    };
  }

  const matchedOrder = createLookupKeys(node?.orderId, node?.id)
    .map((key) => orderTotalsLookup.get(key))
    .find(Boolean);

  if (!matchedOrder || matchedOrder.grandTotal <= grossAmount) {
    return {
      grossAmount,
      commissionAmount,
      netAmount,
      currency: normalizeString(node?.currency || matchedOrder?.currency),
    };
  }

  const resolvedGrossAmount = matchedOrder.grandTotal;
  const resolvedNetAmount =
    commissionAmount > 0
      ? Math.max(0, resolvedGrossAmount - commissionAmount)
      : resolvedGrossAmount;

  return {
    grossAmount: resolvedGrossAmount,
    commissionAmount,
    netAmount:
      netAmount > 0 && Math.abs(netAmount - grossAmount) > 0.01 ? netAmount : resolvedNetAmount,
    currency: normalizeString(node?.currency || matchedOrder.currency),
  };
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

export function mapTransactionsConnection(data, orderTotalsLookup = null) {
  const connection = data?.vendorFinanceTransactions;
  const edges = Array.isArray(connection?.edges) ? connection.edges : [];

  return {
    rows: edges
      .map((edge) => edge?.node)
      .filter(Boolean)
      .map((node) => {
        const amounts = resolveTransactionAmounts(node, orderTotalsLookup);

        return {
          id: normalizeString(node.id),
          orderId: normalizeString(node.orderId),
          customerName: normalizeString(node.customerName),
          eventType: normalizeString(node.eventType),
          eventDate: normalizeString(node.eventDate),
          grossAmount: formatCurrency(amounts.grossAmount, amounts.currency),
          commissionAmount: `-${formatCurrency(amounts.commissionAmount, amounts.currency)}`,
          netAmount: formatCurrency(amounts.netAmount, amounts.currency),
          currency: normalizeString(amounts.currency),
          payoutStatus: normalizeString(node.payoutStatus),
          createdOn: normalizeString(node.createdOn),
        };
      }),
    pageInfo: {
      hasNextPage: Boolean(connection?.pageInfo?.hasNextPage),
      endCursor: normalizeString(connection?.pageInfo?.endCursor),
    },
    totalCount: parseNumber(connection?.totalCount),
  };
}

export function mapTransactionDetail(node, orderTotalsLookup = null) {
  if (!node) {
    return null;
  }

  const amounts = resolveTransactionAmounts(node, orderTotalsLookup);

  return {
    id: normalizeString(node.id),
    orderId: normalizeString(node.orderId),
    customerName: normalizeString(node.customerName),
    eventType: normalizeString(node.eventType),
    eventDate: normalizeString(node.eventDate),
    grossAmount: formatCurrency(amounts.grossAmount, amounts.currency),
    commissionAmount: `-${formatCurrency(amounts.commissionAmount, amounts.currency)}`,
    netAmount: formatCurrency(amounts.netAmount, amounts.currency),
    currency: normalizeString(amounts.currency),
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
