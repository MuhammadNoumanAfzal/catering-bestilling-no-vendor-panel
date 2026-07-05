export const notificationTabs = ["All", "Unread", "Read"];

export const notificationFilterOptions = [
  "All",
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

function formatDateGroupLabel(value) {
  if (!value) {
    return "Older";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Older";
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return "Older";
}

function buildFallbackDetailTitle(type) {
  if (type === "ORDER") {
    return "Order notification";
  }

  if (type === "REVIEW") {
    return "Review notification";
  }

  if (type === "PAYOUT") {
    return "Payout notification";
  }

  return "Notification";
}

function buildFallbackDetailRows(node, type) {
  const rows = [];

  if (node?.orderNumber) {
    rows.push({ label: "Order", value: node.orderNumber });
  }

  if (node?.orderId) {
    rows.push({ label: "Order ID", value: node.orderId });
  }

  if (node?.reviewId) {
    rows.push({ label: "Review ID", value: node.reviewId });
  }

  if (type === "ORDER") {
    rows.push({ label: "Status", value: "Confirmed" });
    let customerName = "Private Client";
    if (node?.message && node.message.includes("Company '")) {
      const match = node.message.match(/Company '([^']+)'/);
      if (match) {
        customerName = match[1];
      }
    }
    rows.push({ label: "Customer", value: customerName });
    rows.push({ label: "Amount", value: "NOK 165.00" });
  }

  if (node?.createdAt) {
    rows.push({
      label: "Created",
      value: new Date(node.createdAt).toLocaleString("en-GB"),
    });
  }

  if (!rows.length) {
    rows.push({ label: "Type", value: type });
  }

  return rows;
}

export function mapNotificationNode(node) {
  const rawType = node.notificationType || "ALERT";

  // Map raw backend notification types to frontend display types
  let type = "ALERT";
  if (rawType === "VENDOR_PRODUCT_ORDERED" || rawType === "ORDER") {
    type = "ORDER";
  } else if (
    rawType === "review-added" ||
    rawType === "REVIEW_ADDED" ||
    rawType === "REVIEW"
  ) {
    type = "REVIEW";
  } else if (rawType === "PAYOUT") {
    type = "PAYOUT";
  }

  // Prepend ORD- for order number display using orderId if present
  const orderNumber = node.orderId ? `ORD-${node.orderId}` : "";

  return {
    id: node.id,
    type,
    title: node.title || "Notification",
    message: node.message || "",
    actionLabel: type === "PAYOUT" ? "View Receipt" : "View Detail",
    isRead: Boolean(node.isRead),
    highlighted: !node.isRead,
    createdAt: node.createdAt || "",
    dateGroupLabel: formatDateGroupLabel(node.createdAt),
    orderId: node.orderId || "",
    orderNumber: orderNumber,
    reviewId: node.reviewId || "",
    payoutId: "",
    payoutReceiptUrl: "",
    detailTitle: buildFallbackDetailTitle(type),
    detailRows: buildFallbackDetailRows({ ...node, orderNumber }, type),
    livePayload: null,
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
    };
  }

  if (selectedFilter === "All") {
    return {
      datePreset: null,
    };
  }

  const presetMap = {
    "Last Month": "LAST_MONTH",
    "Last 3 Months": "LAST_3_MONTHS",
    "Last 6 Months": "LAST_6_MONTHS",
    "This Year": "THIS_YEAR",
  };

  return {
    datePreset: presetMap[selectedFilter] || null,
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
    return {
      orderId: notification.orderNumber || "--",
      customer: "--",
      status: "",
      amount: "",
      coverImageUrl: "",
      itemsSummary: notification.message || "",
      items: [],
    };
  }

  return {
    orderId: order.orderNumber || notification.orderNumber || "--",
    customer: order.customerName || "--",
    status: order.status || "",
    amount: formatMoney(order.amount, order.currency),
    coverImageUrl: order.coverImageUrl || "",
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
