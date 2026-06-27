export const notificationTabs = ["All", "Unread", "Read"];

export const notificationFilterOptions = [
  "Last Month",
  "Last 3 Months",
  "Last 6 Months",
  "This Year",
  "Custom Date",
];

export function createDefaultCustomRange() {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 7);

  return {
    from: fromDate.toISOString().slice(0, 10),
    to,
  };
}

export function formatFilterDate(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const [year, month, day] = dateValue.split("-");
  return `${day}-${month}-${year}`;
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function formatMoney(amount, currency) {
  if (amount == null || amount === "") {
    return "";
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return currency ? `${currency} ${amount}` : String(amount);
  }

  return currency
    ? `${currency} ${numericAmount.toLocaleString("en-US")}`
    : numericAmount.toLocaleString("en-US");
}

export function mapNotificationNode(node) {
  return {
    id: node.id,
    type: node.type || "ALERT",
    title: node.title || "Notification",
    message: node.message || "",
    actionLabel:
      node.actionLabel ||
      (node.type === "PAYOUT" ? "View Receipt" : "View Detail"),
    isRead: Boolean(node.isRead),
    highlighted: Boolean(node.highlighted),
    createdAt: node.createdAt || "",
    dateGroupLabel: node.dateGroupLabel || "Older",
    orderId: node.orderId || "",
    orderNumber: node.orderNumber || "",
    reviewId: node.reviewId || "",
    payoutId: node.payoutId || "",
    payoutReceiptUrl: node.payoutReceiptUrl || "",
    detailTitle: node.detailTitle || "",
    detailRows: Array.isArray(node.detailRows) ? node.detailRows : [],
    livePayload: node.livePayload || null,
    time: formatTime(node.createdAt),
  };
}

export function mapNotificationsConnection(connection) {
  const items = (connection?.edges || [])
    .map((edge) => edge?.node)
    .filter(Boolean)
    .map(mapNotificationNode);

  return {
    items,
    totalCount: connection?.totalCount || 0,
    unreadCount: connection?.unreadCount || 0,
    pageInfo: {
      hasNextPage: Boolean(connection?.pageInfo?.hasNextPage),
      endCursor: connection?.pageInfo?.endCursor || null,
    },
  };
}

export function groupNotificationsByLabel(items) {
  const groups = new Map();

  items.forEach((item) => {
    const key = item.dateGroupLabel || "Older";
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  });

  return Array.from(groups.entries()).map(([label, groupedItems]) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    items: groupedItems,
  }));
}

export function mapTabToStatus(tab) {
  if (tab === "Unread") return "UNREAD";
  if (tab === "Read") return "READ";
  return "ALL";
}

export function mapFilterToQueryVariables(selectedFilter, customRange) {
  if (selectedFilter === "Custom Date") {
    return {
      datePreset: "CUSTOM",
      from: customRange.from || null,
      to: customRange.to || null,
    };
  }

  const presetMap = {
    "Last Month": "LAST_MONTH",
    "Last 3 Months": "LAST_3_MONTHS",
    "Last 6 Months": "LAST_6_MONTHS",
    "This Year": "THIS_YEAR",
  };

  return {
    datePreset: presetMap[selectedFilter] || "LAST_MONTH",
    from: null,
    to: null,
  };
}

export function buildFilterLabel(selectedFilter, customRange) {
  if (selectedFilter === "Custom Date") {
    return `From: ${formatFilterDate(customRange.from)}  To: ${formatFilterDate(customRange.to)}`;
  }

  return selectedFilter;
}

export function deriveReceiptUrl(notification) {
  return notification?.livePayload?.payout?.receiptUrl || notification?.payoutReceiptUrl || "";
}

export function deriveReceiptAmount(notification) {
  const payout = notification?.livePayload?.payout;
  return formatMoney(payout?.amount, payout?.currency);
}

export function deriveReceiptStatus(notification) {
  return notification?.livePayload?.payout?.status || "Processed";
}

export function deriveOrderSummary(notification) {
  const order = notification?.livePayload?.order;
  if (!order) {
    return null;
  }

  return {
    orderId: order.orderNumber || notification.orderNumber || "--",
    customer: order.customerName || "--",
    status: order.status || "",
    amount: formatMoney(order.amount, order.currency),
    coverImageUrl: order.coverImageUrl || "/heroBg.webp",
    itemsSummary: order.itemsSummary || "",
    items: Array.isArray(order.items) ? order.items : [],
  };
}

export function deriveReviewRows(notification) {
  const review = notification?.livePayload?.review;
  if (!review) {
    return notification?.detailRows || [];
  }

  return [
    { label: "Reviewer", value: review.customerName || "--" },
    { label: "Rating", value: review.rating != null ? `${review.rating} / 5` : "--" },
    { label: "Order", value: review.orderNumber || "--" },
    { label: "Occasion", value: review.occasion || "--" },
    { label: "Comment", value: review.comment || "--" },
  ];
}
