export const notificationTabs = ["All", "Unread", "Read"];

export const notificationFilterOptions = [
  "All",
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
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
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
    }

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    if (diffDays === 1) {
      return "Yesterday";
    }

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(date);
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

  if (node?.title) {
    rows.push({ label: "Title", value: node.title });
  }

  if (node?.message) {
    rows.push({ label: "Message", value: node.message });
  }

  if (node?.orderNumber) {
    rows.push({ label: "Order", value: node.orderNumber });
  }

  if (node?.orderId) {
    rows.push({ label: "Order ID", value: node.orderId });
  }

  if (node?.reviewId) {
    rows.push({ label: "Review ID", value: node.reviewId });
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
  const rawType = (node.notificationType || "ALERT").toUpperCase();

  // Map backend NotificationType enum values to frontend display types
  let type = "ALERT";
  if (
    rawType === "NEW_ORDER" ||
    rawType === "ORDER_UPDATE" ||
    rawType === "VENDOR_PRODUCT_ORDERED" ||
    rawType === "ORDER"
  ) {
    type = "ORDER";
  } else if (
    rawType === "REVIEW_RATING" ||
    rawType === "REVIEW_ADDED" ||
    rawType === "REVIEW"
  ) {
    type = "REVIEW";
  } else if (rawType === "PAYOUT") {
    type = "PAYOUT";
  }

  const orderNumber = node.orderNumber || node.orderId || "";
  const livePayload = {
    order: node?.order || null,
    review: node?.review || null,
    payout: node?.payout || null,
  };

  const payoutReceiptUrl = node?.payout?.receiptUrl || "";
  const payoutId = node?.payout?.id || "";

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
    payoutId,
    payoutReceiptUrl,
    detailTitle: buildFallbackDetailTitle(type),
    detailRows: buildFallbackDetailRows({ ...node, orderNumber }, type),
    livePayload,
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
  return null;
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
    "Today": "TODAY",
    "Yesterday": "YESTERDAY",
    "Last 7 Days": "LAST_7_DAYS",
    "Last 30 Days": "LAST_30_DAYS",
    "This Month": "THIS_MONTH",
    "Last Month": "LAST_MONTH",
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
  return payout ? formatMoney(payout?.amount, payout?.currency) : "";
}

export function deriveReceiptStatus(notification) {
  return notification?.livePayload?.payout?.status || "";
}

export function deriveOrderSummary(notification) {
  const order = notification?.livePayload?.order;
  if (!order) {
    return {
      orderId: notification.orderNumber || notification.orderId || "",
      customer: "",
      status: "",
      amount: "",
      coverImageUrl: "",
      itemsSummary: "",
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
