function normalizeString(value) {
  return value == null ? "" : String(value);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const normalized = normalizeString(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function parseAmount(value) {
  if (typeof value === "number") {
    return value;
  }

  const normalized = normalizeString(value).replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  const amount = parseAmount(value);
  return `kr ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getOrderCartsArray(orderCarts) {
  if (Array.isArray(orderCarts)) {
    return orderCarts;
  }

  if (Array.isArray(orderCarts?.edges)) {
    return orderCarts.edges.map((edge) => edge?.node).filter(Boolean);
  }

  return [];
}

function resolveGuestCount(node, fallbackValue = 0) {
  const cartQuantity = getOrderCartsArray(node?.orderCarts).reduce(
    (sum, cart) => sum + toNumber(cart?.quantity, 0),
    0,
  );

  const candidates = [node?.guestCount, node?.personCount, cartQuantity, fallbackValue]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (candidates.length === 0) {
    return 0;
  }

  return Math.max(...candidates);
}

function formatDateParts(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      dateLabel: "Date unavailable",
      timeLabel: "Time unavailable",
    };
  }

  return {
    dateLabel: date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    timeLabel: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function formatDisplayId(id) {
  const raw = normalizeString(id).trim();
  if (!raw) return "#N/A";
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function formatOrderReference(orderNumber, id) {
  return formatDisplayId(firstNonEmpty(orderNumber, id));
}

function normalizeDeliveryWindow(windowValue, eventTime, fallbackTimeLabel) {
  if (windowValue && typeof windowValue === "object") {
    const label = firstNonEmpty(windowValue.label);
    const start = firstNonEmpty(windowValue.start, eventTime);
    const end = firstNonEmpty(windowValue.end);

    return {
      start,
      end,
      label: label || [start, end].filter(Boolean).join(" - ") || fallbackTimeLabel,
    };
  }

  const windowText = firstNonEmpty(windowValue, eventTime, fallbackTimeLabel);
  return {
    start: firstNonEmpty(eventTime, windowText),
    end: "",
    label: windowText || "Time unavailable",
  };
}

function formatAddressParts(...parts) {
  return parts.map((part) => normalizeString(part).trim()).filter(Boolean).join(", ");
}

function buildAddressFromNode(node) {
  const billingAddress = node?.billingAddress || {};
  const addressLine = firstNonEmpty(
    node?.deliveryAddressStr,
    node?.deliveryAddress,
    billingAddress?.locationName,
    formatAddressParts(billingAddress?.address, billingAddress?.unitFloor),
  );

  const city = firstNonEmpty(node?.deliveryCity, billingAddress?.city, node?.customerInfo?.city);
  const postalCode = firstNonEmpty(
    node?.deliveryPostalCode,
    billingAddress?.postCode,
    node?.customerInfo?.postalCode,
  );

  return {
    addressLine,
    city,
    postalCode,
    fullAddress:
      firstNonEmpty(node?.deliveryAddressStr) ||
      formatAddressParts(addressLine, city, postalCode),
  };
}

function sanitizeOrganization(value) {
  const normalized = normalizeString(value).trim();
  return normalized || "-";
}

function buildCustomerFromApi(node) {
  const customerInfo = node?.customerInfo || {};
  const address = buildAddressFromNode(node);
  const detailsVisible =
    Boolean(node?.customerDetailsVisible) || resolveOrderStatus(node) !== "New";

  return {
    name:
      firstNonEmpty(node?.customerName, customerInfo.fullName) ||
      "Customer unavailable",
    organization: sanitizeOrganization(customerInfo.organization),
    postalCode: firstNonEmpty(customerInfo.postalCode, address.postalCode) || "-",
    city: firstNonEmpty(customerInfo.city, address.city) || "-",
    email: firstNonEmpty(customerInfo.email) || "-",
    phone: firstNonEmpty(customerInfo.phone) || "-",
    detailsVisible,
    historyText: detailsVisible
      ? "View this customer's previous order history."
      : "Customer contact details stay hidden until the order is accepted.",
    historyOrders: [],
  };
}

function buildOrderItems(carts) {
  const primaryCart = carts[0];
  const primaryItem = primaryCart?.item || {};

  const includedItems = carts
    .map((cart) => {
      const item = cart?.item || {};
      const title = firstNonEmpty(item.title, item.name);
      const quantity = toNumber(cart?.quantity, 0);
      if (!title) return "";
      return `${title}${quantity ? ` (x${quantity})` : ""}`;
    })
    .filter(Boolean);

  const totalPrice = carts.reduce((sum, cart) => sum + parseAmount(cart?.totalPriceWithTax), 0);

  return {
    name: firstNonEmpty(primaryItem.title, primaryItem.name) || "Order items unavailable",
    quantity:
      carts.length > 0
        ? `${carts.length} item${carts.length > 1 ? "s" : ""} in this order.`
        : "Item details unavailable",
    description: "ORDER ITEMS",
    includedItems,
    image: primaryItem?.coverImage?.fileUrl || "",
    modalDetails: {
      title: firstNonEmpty(primaryItem.title, primaryItem.name) || "Order items",
      price: formatCurrency(totalPrice),
      facts: [],
      items: includedItems.map((item) => item.replace(/\s+\((x\d+)\)$/, " $1")),
      extras: [],
    },
  };
}

function buildFinancialSummary(order, carts) {
  const cartSubtotal = carts.reduce((sum, cart) => sum + parseAmount(cart?.totalPriceWithTax), 0);
  const total = parseAmount(order?.finalPrice);
  const subtotal = cartSubtotal || total;
  const guestCount = resolveGuestCount(order);
  const companyAllowance = parseAmount(order?.companyAllowance);
  const customerAllowance = parseAmount(order?.customerAllowance);

  const summary = [
    {
      label: `Subtotal${guestCount ? ` (${guestCount} guests)` : ""}`,
      value: formatCurrency(subtotal),
    },
  ];

  if (customerAllowance > 0 || companyAllowance > 0) {
    summary.push({
      label: "Customer Responsibility",
      value: `${customerAllowance || 0}%`,
    });
    summary.push({
      label: "Company Responsibility",
      value: `${companyAllowance || 0}%`,
    });
  }

  summary.push({
    label: "Total",
    value: formatCurrency(total || subtotal),
  });

  return summary;
}

function resolveOrderStatus(node) {
  const statuses = Array.isArray(node?.statuses) ? node.statuses : [];
  const latestStatus = [...statuses]
    .filter((entry) => normalizeString(entry?.status))
    .sort((left, right) => {
      const leftTime = new Date(left?.createdOn || 0).getTime();
      const rightTime = new Date(right?.createdOn || 0).getTime();
      return rightTime - leftTime;
    })[0];

  return normalizeBackendStatus(
    latestStatus?.status || node?.status || node?.statusLabel,
  );
}

export function normalizeBackendStatus(status) {
  const normalized = normalizeString(status).trim().toLowerCase().replace(/[_-]+/g, " ");

  if (!normalized) return "New";
  if (normalized === "new" || normalized === "placed" || normalized === "pending") return "New";
  if (normalized === "accepted" || normalized === "confirmed") return "Accepted";
  if (normalized === "modified") return "Modified";
  if (normalized === "preparing" || normalized === "in preparation") return "Preparing";
  if (normalized === "ready") return "Ready";
  if (normalized === "out for delivery" || normalized === "in transit") return "Out for delivery";
  if (normalized === "delivered" || normalized === "completed") return "Delivered";
  if (normalized === "canceled" || normalized === "cancelled" || normalized === "rejected") {
    return "Canceled";
  }

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getToneForStatus(status) {
  if (status === "New") return "is-new";
  if (status === "Accepted") return "is-accepted";
  if (status === "Preparing") return "is-preparing";
  if (status === "Ready") return "is-ready";
  if (status === "Out for delivery") return "is-delivery";
  if (status === "Delivered") return "is-delivered";
  if (status === "Canceled") return "is-canceled";
  if (status === "Modified") return "is-modified";
  return "is-new";
}

function mapBackendTone(tone, status) {
  const normalizedTone = normalizeString(tone).trim().toLowerCase();

  if (normalizedTone.startsWith("is-")) {
    return normalizedTone;
  }

  if (normalizedTone === "success") {
    return getToneForStatus(status);
  }

  return getToneForStatus(status);
}

function createAction(label, options = {}) {
  return {
    label,
    tone: options.tone ?? "is-muted",
    hasDropdown: Boolean(options.hasDropdown),
    navigateToDetail: Boolean(options.navigateToDetail),
    primary: Boolean(options.primary),
    requestAdjustment: Boolean(options.requestAdjustment),
  };
}

export function getDefaultActionsForStatus(status) {
  if (status === "New") {
    return [
      createAction("Accept", { tone: "is-primary", navigateToDetail: true, primary: true }),
      createAction("Reject", { tone: "is-muted" }),
    ];
  }
  if (status === "Accepted" || status === "Modified") {
    return [createAction("Start preparing", { tone: "is-primary", hasDropdown: true, primary: true })];
  }
  if (status === "Preparing") {
    return [createAction("Ready", { tone: "is-primary", hasDropdown: true, primary: true })];
  }
  if (status === "Ready") {
    return [createAction("Out for delivery", { tone: "is-primary", hasDropdown: true, primary: true })];
  }
  if (status === "Out for delivery") {
    return [createAction("Delivered", { tone: "is-primary", hasDropdown: true, primary: true })];
  }

  return [createAction("View Details", { tone: "is-muted", navigateToDetail: true })];
}

export function mapAvailableActionsToUi(availableActions, status) {
  if (!Array.isArray(availableActions) || availableActions.length === 0) {
    return getDefaultActionsForStatus(status);
  }

  const actions = availableActions
    .map((value) => normalizeString(value))
    .filter(Boolean)
    .map((value) => {
      const normalized = value.trim().toLowerCase().replace(/[_-]+/g, " ");

      if (normalized === "accept" || normalized === "accept order") {
        return createAction("Accept", { tone: "is-primary", navigateToDetail: true, primary: true });
      }
      if (normalized === "reject" || normalized === "reject order" || normalized === "cancel") {
        return createAction("Reject", { tone: "is-muted" });
      }
      if (normalized === "request changes" || normalized === "request change" || normalized === "adjust") {
        return createAction("Request Changes", { tone: "is-muted", requestAdjustment: true });
      }
      if (normalized === "preparing" || normalized === "start preparing") {
        return createAction("Preparing", { tone: "is-primary", primary: true });
      }
      if (normalized === "ready") {
        return createAction("Ready", { tone: "is-primary", primary: true });
      }
      if (normalized === "out for delivery") {
        return createAction("Out for Delivery", { tone: "is-primary", primary: true });
      }
      if (normalized === "delivered" || normalized === "mark delivered") {
        return createAction("Delivered", { tone: "is-primary", primary: true });
      }

      return createAction(value, {
        tone: "is-muted",
        navigateToDetail: true,
      });
    });

  return actions.length ? actions : getDefaultActionsForStatus(status);
}

export function getStatusMutationValue(status) {
  const normalizedStatus = normalizeBackendStatus(status);

  if (normalizedStatus === "New") {
    return "PENDING";
  }

  if (normalizedStatus === "Accepted") {
    return "CONFIRMED";
  }

  if (normalizedStatus === "Out for delivery") {
    return "OUT_FOR_DELIVERY";
  }

  if (normalizedStatus === "Delivered") {
    return "COMPLETED";
  }

  if (normalizedStatus === "Canceled") {
    return "CANCELED";
  }

  return normalizedStatus.toUpperCase().replace(/\s+/g, "_");
}

export function mapVendorOrderNode(node) {
  const status = resolveOrderStatus(node);
  const deliveryDate = node?.deliveryDate || node?.placedAt || node?.createdOn;
  const { dateLabel, timeLabel } = formatDateParts(deliveryDate);
  const carts = getOrderCartsArray(node?.orderCarts);
  const primaryTitle = firstNonEmpty(carts[0]?.item?.title, carts[0]?.item?.name);
  const deliveryWindow = normalizeDeliveryWindow(node?.deliveryWindow, node?.eventTime, timeLabel);

  return {
    rawId: normalizeString(node?.id),
    version: toNumber(node?.version, 0),
    id: formatOrderReference(node?.orderNumber, node?.id),
    customer:
      firstNonEmpty(node?.customerName, node?.customerInfo?.fullName) ||
      "Customer unavailable",
    event: firstNonEmpty(node?.eventName, primaryTitle) || "Order",
    guests: resolveGuestCount(node, 0),
    date: dateLabel,
    time: firstNonEmpty(deliveryWindow.start, node?.eventTime, timeLabel) || timeLabel,
    status,
    statusTone: mapBackendTone(node?.statusTone, status),
    actions: mapAvailableActionsToUi(node?.availableActions, status),
    raw: node,
  };
}

export function mapVendorOrdersResult(data) {
  const connection = data?.orders;
  const edges = Array.isArray(connection?.edges) ? connection.edges : [];
  const rows = edges.map((edge) => mapVendorOrderNode(edge?.node)).filter((row) => row.rawId);

  return {
    rows,
    totalCount: Number(connection?.totalCount) || rows.length,
    summary: data?.vendorOrderSummary || null,
  };
}

export function mapVendorOrderSummary(summary, rows = []) {
  const summaryObject = summary && typeof summary === "object" ? summary : {};
  const rowCount = (statusLabel) => rows.filter((row) => row.status === statusLabel).length;

  return {
    total: toNumber(summaryObject.totalOrders ?? summaryObject.total_orders, rows.length),
    newOrders: toNumber(summaryObject.newOrders ?? summaryObject.new_orders, rowCount("New")),
    accepted: toNumber(
      summaryObject.acceptedOrders ?? summaryObject.accepted_orders ?? summaryObject.accepted,
      rowCount("Accepted"),
    ),
    preparing: toNumber(summaryObject.preparing, rowCount("Preparing")),
    ready: toNumber(summaryObject.ready, rowCount("Ready")),
    outForDelivery: toNumber(
      summaryObject.outForDelivery ?? summaryObject.out_for_delivery,
      rowCount("Out for delivery"),
    ),
    delivered: toNumber(summaryObject.delivered, rowCount("Delivered")),
    canceled: toNumber(summaryObject.canceled ?? summaryObject.cancelled, rowCount("Canceled")),
    modified: toNumber(summaryObject.modified, rowCount("Modified")),
  };
}

export function createOrderMetrics(summary) {
  return [
    {
      label: "Total Orders",
      value: String(summary.total),
      helper: "Loaded from backend",
      helperTone: "is-positive",
      icon: "clipboard",
    },
    {
      label: "New Orders",
      value: String(summary.newOrders),
      helper: "Awaiting review",
      icon: "cart",
    },
    {
      label: "Accepted",
      value: String(summary.accepted),
      helper: "Confirmed",
      icon: "check",
    },
    {
      label: "Preparing",
      value: String(summary.preparing),
      helper: "In kitchen",
      icon: "chef",
    },
    {
      label: "Ready",
      value: String(summary.ready),
      helper: "Awaiting dispatch",
      icon: "package",
    },
    {
      label: "Out for Delivery",
      value: String(summary.outForDelivery),
      helper: "On the way",
      icon: "truck",
    },
    {
      label: "Delivered",
      value: String(summary.delivered),
      helper: "Completed",
      icon: "badge",
    },
  ];
}

export function createOrderTabs(summary) {
  return [
    { label: "All", count: summary.total },
    { label: "New", count: summary.newOrders },
    { label: "Modified", count: summary.modified },
    { label: "Delivered", count: summary.delivered },
    { label: "Pending", count: summary.preparing + summary.ready + summary.outForDelivery },
    { label: "Accepted", count: summary.accepted },
    { label: "Canceled", count: summary.canceled },
  ];
}

export function mapVendorOrderDetail(data, orderId) {
  const node = data?.order;
  if (!node) {
    return null;
  }

  const carts = getOrderCartsArray(node?.orderCarts);
  const deliveryDate = node?.deliveryDate || node?.placedAt || node?.createdOn;
  const { dateLabel, timeLabel } = formatDateParts(deliveryDate);
  const status = resolveOrderStatus(node);
  const actions = mapAvailableActionsToUi(node?.availableActions, status);
  const customer = buildCustomerFromApi(node);
  const orderItem = buildOrderItems(carts);
  const address = buildAddressFromNode(node);
  const deliveryWindow = normalizeDeliveryWindow(node?.deliveryWindow, node?.eventTime, timeLabel);

  return {
    rawId: normalizeString(node?.id),
    version: toNumber(node?.version, 0),
    id: formatOrderReference(node?.orderNumber, node?.id || orderId),
    date: dateLabel,
    time: firstNonEmpty(deliveryWindow.start, node?.eventTime, timeLabel) || timeLabel,
    guests: resolveGuestCount(node, 0),
    status,
    statusTone: mapBackendTone(node?.statusTone, status),
    customer,
    orderItem,
    addOns: [],
    note: "",
    logistics: {
      deliveryAddress: address.addressLine || "Address unavailable from API",
      eventDate: dateLabel,
      deliveryWindow: deliveryWindow.label || "Time unavailable",
      fullAddress: address.fullAddress || address.addressLine || "Address unavailable from API",
      eventType: firstNonEmpty(node?.eventName, orderItem.name) || "Order",
      serviceType: firstNonEmpty(node?.deliveryType, node?.paymentType) || "Service unavailable",
      city: address.city || "-",
      postalCode: address.postalCode || "-",
      billingAddress: node?.billingAddress || null,
    },
    financialSummary: buildFinancialSummary(node, carts),
    actions,
    availableActions: Array.isArray(node?.availableActions) ? node.availableActions : [],
    statuses: Array.isArray(node?.statuses) ? node.statuses : [],
    adjustments: [],
    tableware: node?.tableware ? {
      napkins: Boolean(node.tableware.napkins),
      utensils: Boolean(node.tableware.utensils),
      platesBowls: Boolean(node.tableware.platesBowls),
      instructions: node.tableware.instructions || "",
    } : null,
    raw: {
      ...node,
      orderCarts: carts,
    },
  };
}
