import { clearPendingAdjustment, getPendingAdjustment } from "../utils/pendingAdjustments";

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

function getPricingBlock(node) {
  return node?.pricing && typeof node.pricing === "object" ? node.pricing : {};
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
  const rawValue = normalizeString(value).trim();
  const normalizedValue =
    /^\d{4}-\d{2}-\d{2}$/.test(rawValue) ? `${rawValue}T00:00:00` : rawValue;
  const date = new Date(normalizedValue);

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

function normalizeAddressSnapshot(addressValue) {
  if (!addressValue || typeof addressValue !== "object") {
    return {
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
    };
  }

  return {
    addressLine1: firstNonEmpty(addressValue.addressLine1, addressValue.address),
    addressLine2: firstNonEmpty(addressValue.addressLine2, addressValue.unitFloor),
    city: firstNonEmpty(addressValue.city),
    postalCode: firstNonEmpty(addressValue.postalCode, addressValue.postCode),
  };
}

function buildAddressFromNode(node) {
  const billingAddress = node?.billingAddress || {};
  const snapshotAddress = normalizeAddressSnapshot(node?.deliveryAddress);
  const addressLine = firstNonEmpty(
    node?.deliveryAddressStr,
    formatAddressParts(snapshotAddress.addressLine1, snapshotAddress.addressLine2),
    billingAddress?.locationName,
    formatAddressParts(billingAddress?.address, billingAddress?.unitFloor),
  );

  const city = firstNonEmpty(
    node?.deliveryCity,
    snapshotAddress.city,
    billingAddress?.city,
    node?.customerInfo?.city,
  );
  const postalCode = firstNonEmpty(
    node?.deliveryPostalCode,
    snapshotAddress.postalCode,
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
    email: firstNonEmpty(node?.email, customerInfo.email) || "-",
    phone: firstNonEmpty(node?.phone, customerInfo.phone) || "-",
    detailsVisible,
    historyText: detailsVisible
      ? "View this customer's previous order history."
      : "Customer contact details stay hidden until the order is accepted.",
    historyOrders: [],
  };
}

function buildOrderItems(items = [], carts = []) {
  const primaryOrderItem = Array.isArray(items) ? items[0] : null;
  const primaryCart = carts[0];
  const primaryItem = primaryOrderItem || primaryCart?.item || {};

  const includedItems = [];
  if (Array.isArray(items) && items.length > 0) {
    items.forEach((item) => {
      const itemTitle = firstNonEmpty(item.productName, item.name);
      if (itemTitle) {
        const quantity = toNumber(item?.quantity, 0);
        includedItems.push(`${itemTitle}${quantity ? ` (x${quantity})` : ""}`);
      }
    });
  } else {
    carts.forEach((cart) => {
      const item = cart?.item || {};
      const itemTitle = firstNonEmpty(item.title, item.name);

      if (Array.isArray(item.menuItems) && item.menuItems.length > 0) {
        item.menuItems.forEach((mi) => {
          const title = mi.title || mi.name;
          if (title) {
            includedItems.push(title);
          }
        });
      } else if (itemTitle) {
        const quantity = toNumber(cart?.quantity, 0);
        includedItems.push(`${itemTitle}${quantity ? ` (x${quantity})` : ""}`);
      }
    });
  }

  const totalPrice =
    Array.isArray(items) && items.length > 0
      ? items.reduce((sum, item) => sum + parseAmount(item?.lineTotal), 0)
      : carts.reduce((sum, cart) => sum + parseAmount(cart?.totalPriceWithTax), 0);

  return {
    name:
      firstNonEmpty(primaryItem.productName, primaryItem.title, primaryItem.name) ||
      "Order items unavailable",
    quantity:
      includedItems.length > 0
        ? `${includedItems.length} item${includedItems.length > 1 ? "s" : ""} in this order.`
        : "No items",
    description: primaryItem.description || primaryItem?.product?.description || "",
    includedItems,
    image:
      primaryItem?.product?.coverImage?.fileUrl ||
      primaryItem?.coverImage?.fileUrl ||
      primaryItem?.imageUrl ||
      "",
    modalDetails: {
      title: firstNonEmpty(primaryItem.title, primaryItem.name),
      price: formatCurrency(totalPrice),
      facts: [],
      items: includedItems.map((item) => item.replace(/\s+\((x\d+)\)$/, " $1")),
      extras: [],
    },
  };
}

function normalizeTaxRate(value) {
  const parsed = parseAmount(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed > 1 ? parsed / 100 : parsed;
}

function getOrderItemsArray(order) {
  return Array.isArray(order?.items) ? order.items : [];
}

function calculateAdjustedSubtotalFromItems(order, guestCount) {
  const items = getOrderItemsArray(order);
  const normalizedGuestCount = Math.max(1, toNumber(guestCount, 1));

  if (items.length === 0) {
    return null;
  }

  const adjustedSubtotal = items.reduce((sum, item) => {
    const pricingType = normalizeString(item?.pricingType).trim().toLowerCase();
    const quantity = Math.max(1, toNumber(item?.quantity, 1));
    const lineSubtotal = parseAmount(item?.lineSubtotal);
    const unitPrice = parseAmount(item?.unitPrice);

    if (pricingType === "fixed") {
      if (lineSubtotal > 0) {
        return sum + lineSubtotal;
      }

      return sum + unitPrice * quantity;
    }

    if (unitPrice > 0) {
      return sum + unitPrice * quantity * normalizedGuestCount;
    }

    const itemGuestCount = Math.max(1, resolveGuestCount(order, normalizedGuestCount));

    if (lineSubtotal > 0) {
      return sum + (lineSubtotal / itemGuestCount) * normalizedGuestCount;
    }

    return sum;
  }, 0);

  return adjustedSubtotal > 0 ? adjustedSubtotal : null;
}

function buildFinancialSummary(order, carts) {
  const pricing = getPricingBlock(order);
  const guestCount = resolveGuestCount(order);
  const originalSubtotal =
    parseAmount(pricing.subtotal) ||
    carts.reduce((sum, cart) => sum + parseAmount(cart?.totalPriceWithTax), 0) ||
    parseAmount(order?.finalPrice);
  const deliveryFee = parseAmount(pricing.deliveryFee);
  const tipAmount = parseAmount(pricing.tipAmount);
  const addOnsTotal = parseAmount(pricing.addOnsTotal || order?.addOnsTotal);
  const discountAmount = parseAmount(pricing.discountAmount);
  const serviceFee = parseAmount(pricing.serviceFee);
  const adjustedSubtotal = calculateAdjustedSubtotalFromItems(order, guestCount);
  const baseSubtotal = adjustedSubtotal || originalSubtotal;
  const taxBase = Math.max(0, baseSubtotal + addOnsTotal);
  const derivedTaxRate =
    normalizeTaxRate(pricing.taxRate) ||
    (originalSubtotal + addOnsTotal > 0
      ? parseAmount(pricing.taxAmount) / (originalSubtotal + addOnsTotal)
      : 0);
  const taxAmount = taxBase > 0 ? taxBase * derivedTaxRate : parseAmount(pricing.taxAmount);
  const calculatedGrandTotal =
    baseSubtotal + deliveryFee + taxAmount + addOnsTotal + tipAmount + serviceFee - discountAmount;
  const grandTotal =
    adjustedSubtotal != null
      ? calculatedGrandTotal
      : parseAmount(pricing.grandTotal) || calculatedGrandTotal;

  const companyAllowance = parseAmount(order?.companyAllowance);
  const customerAllowance = parseAmount(order?.customerAllowance);

  const summary = [
    {
      label: `Subtotal${guestCount ? ` (${guestCount} guests)` : ""}`,
      value: formatCurrency(baseSubtotal),
    },
  ];

  if (deliveryFee > 0) {
    summary.push({
      label: "Delivery Fee",
      value: formatCurrency(deliveryFee),
    });
  }

  if (taxAmount > 0) {
    summary.push({
      label: "Sales Tax",
      value: formatCurrency(taxAmount),
    });
  }

  if (addOnsTotal > 0) {
    summary.push({
      label: "Add-ons",
      value: formatCurrency(addOnsTotal),
    });
  }

  if (tipAmount > 0) {
    summary.push({
      label: "Tip",
      value: formatCurrency(tipAmount),
    });
  }

  if (serviceFee > 0) {
    summary.push({
      label: "Service Fee",
      value: formatCurrency(serviceFee),
    });
  }

  if (discountAmount > 0) {
    summary.push({
      label: "Discount",
      value: `- ${formatCurrency(discountAmount)}`,
    });
  }

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
    value: formatCurrency(grandTotal),
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
  if (
    normalized === "accepted" ||
    normalized === "confirmed" ||
    normalized === "confirm"
  ) {
    return "Accepted";
  }
  if (
    normalized === "modified" ||
    normalized === "adjustment requested" ||
    normalized === "modification requested" ||
    normalized === "change requested"
  ) {
    return "Modified";
  }
  if (
    normalized === "preparing" ||
    normalized === "in preparation" ||
    normalized === "start preparing" ||
    normalized === "processing"
  ) {
    return "Preparing";
  }
  if (
    normalized === "ready" ||
    normalized === "food ready" ||
    normalized === "ready to deliver" ||
    normalized === "ready to dispatch"
  ) {
    return "Ready";
  }
  if (
    normalized === "out for delivery" ||
    normalized === "in transit"
  ) {
    return "Out for delivery";
  }
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
  const storedPendingAdjustment = getPendingAdjustment(node?.id);
  const backendPendingAdjustment = normalizePendingVendorAdjustment(node?.pendingVendorAdjustment);
  const latestVendorAdjustment = normalizePendingVendorAdjustment(node?.latestVendorAdjustment);
  const shouldIgnoreStoredPendingAdjustment =
    !backendPendingAdjustment && isClosedVendorAdjustment(latestVendorAdjustment);

  if (shouldIgnoreStoredPendingAdjustment) {
    clearPendingAdjustment(node?.id);
  }

  const pendingAdjustment =
    backendPendingAdjustment || (shouldIgnoreStoredPendingAdjustment ? null : storedPendingAdjustment);
  const hasPendingCustomerModification =
    `${node?.pendingModificationRequest?.status ?? ""}`.trim().toUpperCase() === "PENDING";
  const hasPendingVendorAdjustment = hasOpenVendorAdjustment(node, pendingAdjustment);
  const displayId = formatOrderReference(node?.invoiceNumber || node?.orderNumber, node?.id);
  const status =
    hasPendingVendorAdjustment || hasPendingCustomerModification
      ? "Modified"
      : isRejectedVendorAdjustment(latestVendorAdjustment)
        ? "Canceled"
      : resolveOrderStatus(node);
  const deliveryDate = node?.eventDate || node?.deliveryDate || node?.placedAt || node?.createdOn;
  const { dateLabel, timeLabel } = formatDateParts(deliveryDate);
  const carts = getOrderCartsArray(node?.orderCarts);
  const primaryTitle = firstNonEmpty(carts[0]?.item?.title, carts[0]?.item?.name);
  const deliveryWindow = normalizeDeliveryWindow(node?.deliveryWindow, node?.eventTime, timeLabel);
  const actions = status === "Canceled" ? [] : mapAvailableActionsToUi(node?.availableActions, status);

  return {
    rawId: normalizeString(node?.id),
    displayId,
    version: toNumber(node?.version, 0),
    id: normalizeString(node?.id),
    customer:
      firstNonEmpty(node?.customerName, node?.customerInfo?.fullName) ||
      "Customer unavailable",
    event: firstNonEmpty(node?.eventName, primaryTitle) || "Order",
    guests: resolveGuestCount(node, 0),
    date: dateLabel,
    time: firstNonEmpty(node?.eventTime, deliveryWindow.start, timeLabel) || timeLabel,
    total: formatCurrency(getPricingBlock(node).grandTotal || node?.finalPrice),
    status,
    statusTone: hasPendingVendorAdjustment ? "is-modified" : mapBackendTone(node?.statusTone, status),
    hasPendingVendorAdjustment,
    actions,
    raw: node,
  };
}

export function mapVendorOrdersResult(data) {
  const connection = data?.vendorOrders || data?.vendorUpcomingOrders || data?.orders;
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
  const rowCount = (...statusLabels) =>
    rows.filter((row) => statusLabels.includes(row.status)).length;
  const hasRows = rows.length > 0;
  const resolveCount = (summaryValue, fallback) =>
    hasRows ? fallback : toNumber(summaryValue, fallback);

  return {
    total: resolveCount(summaryObject.totalOrders ?? summaryObject.total_orders, rows.length),
    upcoming: toNumber(summaryObject.upcomingOrders ?? summaryObject.upcoming_orders, 0),
    newOrders: resolveCount(
      summaryObject.newOrders ?? summaryObject.new_orders,
      rowCount("New"),
    ),
    accepted: resolveCount(
      summaryObject.acceptedOrders ?? summaryObject.accepted_orders ?? summaryObject.accepted,
      rowCount("Accepted"),
    ),
    preparing: resolveCount(summaryObject.preparing, rowCount("Preparing")),
    ready: resolveCount(summaryObject.ready, rowCount("Ready")),
    outForDelivery: resolveCount(
      summaryObject.outForDelivery ?? summaryObject.out_for_delivery,
      rowCount("Out for delivery", "Out for Delivery"),
    ),
    delivered: resolveCount(summaryObject.delivered, rowCount("Delivered")),
    canceled: resolveCount(
      summaryObject.canceled ?? summaryObject.cancelled,
      rowCount("Canceled"),
    ),
    modified: resolveCount(summaryObject.modified, rowCount("Modified")),
  };
}

function normalizePendingVendorAdjustment(adjustment) {
  if (!adjustment || typeof adjustment !== "object" || !adjustment.id) {
    return null;
  }

  return {
    id: normalizeString(adjustment.id),
    status: normalizeString(adjustment.status) || "PENDING_CUSTOMER_APPROVAL",
    reason: normalizeString(adjustment.reason),
    vendorNote: normalizeString(adjustment.vendorNote),
    proposedEventDate: normalizeString(adjustment.proposedEventDate),
    proposedDeliveryWindowStart: normalizeString(adjustment.proposedDeliveryWindowStart),
    proposedGuestCount: toNumber(adjustment.proposedGuestCount, 0),
    proposedAddressLine1: normalizeString(adjustment.proposedAddressLine1),
    proposedAddressLine2: normalizeString(adjustment.proposedAddressLine2),
    proposedCity: normalizeString(adjustment.proposedCity),
    proposedPostalCode: normalizeString(adjustment.proposedPostalCode),
    oldTotal: adjustment.oldTotal == null ? null : Number(adjustment.oldTotal),
    newTotal: adjustment.newTotal == null ? null : Number(adjustment.newTotal),
    createdOn: normalizeString(adjustment.createdOn),
    removedItemNames: Array.isArray(adjustment.removedItemNames) ? adjustment.removedItemNames : [],
    addedItemNames: Array.isArray(adjustment.addedItemNames) ? adjustment.addedItemNames : [],
  };
}

function isClosedVendorAdjustment(adjustment) {
  const normalizedStatus = `${adjustment?.status ?? ""}`.trim().toUpperCase();
  return ["APPROVED", "REJECTED", "DECLINED", "CANCELED", "CANCELLED", "DELIVERED"].includes(
    normalizedStatus,
  );
}

function isRejectedVendorAdjustment(adjustment) {
  const normalizedStatus = `${adjustment?.status ?? ""}`.trim().toUpperCase();
  return ["REJECTED", "DECLINED", "CANCELED", "CANCELLED"].includes(normalizedStatus);
}

function hasOpenVendorAdjustment(node, fallbackAdjustment = null) {
  const normalizedStatus = `${node?.pendingVendorAdjustment?.status ?? fallbackAdjustment?.status ?? ""}`
    .trim()
    .toUpperCase();
  const hasBackendFlag = Boolean(node?.hasPendingVendorAdjustment);

  return hasBackendFlag || normalizedStatus === "PENDING_CUSTOMER_APPROVAL" || normalizedStatus === "PENDING";
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
    { label: "Upcoming", count: summary.upcoming || 0 },
    { label: "New", count: summary.newOrders },
    { label: "Modified", count: summary.modified },
    { label: "Delivered", count: summary.delivered },
    { label: "Pending", count: summary.preparing + summary.ready + summary.outForDelivery },
    { label: "Accepted", count: summary.accepted },
    { label: "Canceled", count: summary.canceled },
  ];
}

export function mapVendorOrderDetail(data, orderId) {
  const node = data?.vendorOrder || data?.order;
  if (!node) {
    return null;
  }

  const storedPendingAdjustment = getPendingAdjustment(node?.id || orderId);
  const backendPendingAdjustment = normalizePendingVendorAdjustment(node?.pendingVendorAdjustment);
  const latestVendorAdjustment = normalizePendingVendorAdjustment(node?.latestVendorAdjustment);
  const shouldIgnoreStoredPendingAdjustment =
    !backendPendingAdjustment && isClosedVendorAdjustment(latestVendorAdjustment);

  if (shouldIgnoreStoredPendingAdjustment) {
    clearPendingAdjustment(node?.id || orderId);
  }

  const pendingAdjustment =
    backendPendingAdjustment || (shouldIgnoreStoredPendingAdjustment ? null : storedPendingAdjustment);
  const carts = getOrderCartsArray(node?.orderCarts);
  const deliveryDate = node?.eventDate || node?.deliveryDate || node?.placedAt || node?.createdOn;
  const { dateLabel, timeLabel } = formatDateParts(deliveryDate);
  const hasPendingCustomerModification =
    `${node?.pendingModificationRequest?.status ?? ""}`.trim().toUpperCase() === "PENDING";
  const hasPendingVendorAdjustment = hasOpenVendorAdjustment(node, pendingAdjustment);
  const displayId = formatOrderReference(node?.invoiceNumber || node?.orderNumber, node?.id || orderId);
  const status =
    hasPendingVendorAdjustment || hasPendingCustomerModification
      ? "Modified"
      : isRejectedVendorAdjustment(latestVendorAdjustment)
        ? "Canceled"
      : resolveOrderStatus(node);
  const actions = status === "Canceled" ? [] : mapAvailableActionsToUi(node?.availableActions, status);
  const customer = buildCustomerFromApi(node);
  const orderItems = Array.isArray(node?.items) ? node.items : [];
  const orderItem = buildOrderItems(orderItems, carts);
  const address = buildAddressFromNode(node);
  const deliveryWindow = normalizeDeliveryWindow(node?.deliveryWindow, node?.eventTime, timeLabel);

  let addOns = orderItems
    .flatMap((item) => item.selectedAddons || [])
    .map((addon) => (typeof addon === "string" ? addon : addon?.name || addon?.title || ""))
    .filter(Boolean);

  const note =
    node?.orderNotes ||
    firstNonEmpty(node?.specialInstructions, node?.notes) ||
    "";

  return {
    rawId: normalizeString(node?.id),
    displayId,
    version: toNumber(node?.version, 0),
    id: normalizeString(node?.id || orderId),
    date: dateLabel,
    time: firstNonEmpty(node?.eventTime, deliveryWindow.start, timeLabel) || timeLabel,
    guests: resolveGuestCount(node, 0),
    status,
    statusTone: hasPendingVendorAdjustment ? "is-modified" : mapBackendTone(node?.statusTone, status),
    hasPendingVendorAdjustment,
    customer,
    orderItem,
    addOns,
    note,
    logistics: {
      deliveryAddress: address.addressLine || "Address unavailable from API",
      eventDate: dateLabel,
      deliveryWindow: firstNonEmpty(node?.eventTime, deliveryWindow.label) || "Time unavailable",
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
    adjustments: pendingAdjustment ? [pendingAdjustment] : [],
    latestVendorAdjustment,
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
