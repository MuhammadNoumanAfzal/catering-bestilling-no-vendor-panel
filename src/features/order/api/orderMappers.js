import { orderDetailRecords, ordersTableRows } from "../data/orderData";

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

function resolveGuestCount(node, fallbackValue = 0) {
  const candidates = [
    node?.personCount,
    node?.guestCount,
    node?.companyAllowance,
    node?.customerAllowance,
    fallbackValue,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (candidates.length === 0) {
    return 0;
  }

  return Math.max(...candidates);
}

export function normalizeBackendStatus(status) {
  const normalized = normalizeString(status).trim().toLowerCase().replace(/[_-]+/g, " ");

  if (!normalized) return "New";
  if (normalized === "new") return "New";
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
  const normalizedTone = normalizeString(tone).trim();
  if (normalizedTone && normalizedTone.startsWith("is-")) {
    return normalizedTone;
  }

  return getToneForStatus(status);
}

export function getDefaultActionsForStatus(status) {
  if (status === "New") {
    return [
      { label: "Accept", tone: "is-primary", navigateToDetail: true },
      { label: "Reject", tone: "is-muted" },
    ];
  }
  if (status === "Accepted" || status === "Modified") {
    return [{ label: "Start preparing", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Preparing") {
    return [{ label: "Ready", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Ready") {
    return [{ label: "Out for delivery", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Out for delivery") {
    return [{ label: "Delivered", tone: "is-primary", hasDropdown: true }];
  }

  return [{ label: "View Details", tone: "is-muted", navigateToDetail: true }];
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

      if (normalized === "accept") {
        return { label: "Accept", tone: "is-primary", navigateToDetail: true };
      }
      if (normalized === "reject" || normalized === "cancel") {
        return { label: "Reject", tone: "is-muted" };
      }
      if (normalized === "preparing" || normalized === "start preparing") {
        return { label: "Start preparing", tone: "is-primary", hasDropdown: true };
      }
      if (normalized === "ready") {
        return { label: "Ready", tone: "is-primary", hasDropdown: true };
      }
      if (normalized === "out for delivery") {
        return { label: "Out for delivery", tone: "is-primary", hasDropdown: true };
      }
      if (normalized === "delivered" || normalized === "mark delivered") {
        return { label: "Delivered", tone: "is-primary", hasDropdown: true };
      }

      return {
        label: value,
        tone: "is-muted",
        navigateToDetail: true,
      };
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

function formatDisplayId(id) {
  const raw = normalizeString(id).trim();
  if (!raw) return "#N/A";
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function formatOrderReference(orderNumber, id) {
  return formatDisplayId(firstNonEmpty(orderNumber, id));
}

function formatCurrency(value) {
  const amount = parseAmount(value);
  return `kr ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function getFallbackOrderByFriendlyId(orderId) {
  const normalizedOrderId = normalizeString(orderId).replace(/^#/, "");

  return (
    ordersTableRows.find((order) => normalizeString(order.id).replace(/^#/, "") === normalizedOrderId) ||
    orderDetailRecords[normalizedOrderId] ||
    null
  );
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

function buildFallbackCustomer(detail, addressFallback) {
  const customer = detail?.customer || {};

  return {
    name: customer.name || "Customer unavailable",
    organization: customer.organization || "Organization unavailable",
    postalCode:
      customer.postalCode ||
      normalizeString(addressFallback?.postalCode ?? addressFallback?.postCode) ||
      "-",
    city: customer.city || normalizeString(addressFallback?.city) || "-",
    email: customer.email || "Email unavailable",
    historyText: customer.historyText || "Customer history is not available from the API yet.",
    historyOrders: Array.isArray(customer.historyOrders) ? customer.historyOrders : [],
  };
}

function buildCustomerFromApi(node, fallbackDetail, addressFallback) {
  const customerInfo = node?.customerInfo || {};
  const fallbackCustomer = buildFallbackCustomer(fallbackDetail, addressFallback);

  return {
    name: firstNonEmpty(customerInfo.fullName, node?.customerName, fallbackCustomer.name) || "Customer unavailable",
    organization: firstNonEmpty(customerInfo.organization, fallbackCustomer.organization) || "Organization unavailable",
    postalCode:
      firstNonEmpty(
        customerInfo.postalCode,
        addressFallback?.postalCode,
        addressFallback?.postCode,
        fallbackCustomer.postalCode,
      ) || "-",
    city:
      firstNonEmpty(customerInfo.city, addressFallback?.city, fallbackCustomer.city) || "-",
    email: firstNonEmpty(customerInfo.email, fallbackCustomer.email) || "Email unavailable",
    phone: firstNonEmpty(customerInfo.phone),
    historyText: fallbackCustomer.historyText,
    historyOrders: fallbackCustomer.historyOrders,
  };
}

function buildOrderItems(orderCarts, fallbackDetail) {
  const carts = Array.isArray(orderCarts) ? orderCarts : [];
  const primaryCart = carts[0];
  const fallbackItem = fallbackDetail?.orderItem;

  const includedItems = carts
    .map((cart) => {
      const title = normalizeString(cart?.item?.title ?? cart?.item?.name);
      const quantity = toNumber(cart?.quantity, 0);
      if (!title) return "";
      return `${title}${quantity ? ` (x${quantity})` : ""}`;
    })
    .filter(Boolean);

  return {
    name:
      normalizeString(primaryCart?.item?.title ?? primaryCart?.item?.name) ||
      normalizeString(fallbackItem?.name) ||
      "Order items unavailable",
    quantity:
      carts.length > 0
        ? `${carts.length} item${carts.length > 1 ? "s" : ""} in this order.`
        : normalizeString(fallbackItem?.quantity) || "Item details unavailable",
    description: normalizeString(fallbackItem?.description) || "ORDER ITEMS",
    includedItems: includedItems.length ? includedItems : fallbackItem?.includedItems || [],
    modalDetails: {
      title:
        normalizeString(primaryCart?.item?.title ?? primaryCart?.item?.name) ||
        normalizeString(fallbackItem?.modalDetails?.title) ||
        "Order items",
      price:
        carts.length > 0
          ? formatCurrency(
              carts.reduce((sum, cart) => sum + parseAmount(cart?.totalPriceWithTax), 0),
            )
          : normalizeString(fallbackItem?.modalDetails?.price) || "kr 0.00",
      facts: fallbackItem?.modalDetails?.facts || [],
      items:
        carts.length > 0
          ? carts
              .map((cart) => {
                const title = normalizeString(cart?.item?.title ?? cart?.item?.name);
                const quantity = toNumber(cart?.quantity, 0);
                if (!title) return "";
                return `${title}${quantity ? ` x${quantity}` : ""}`;
              })
              .filter(Boolean)
          : fallbackItem?.modalDetails?.items || [],
      extras: fallbackItem?.modalDetails?.extras || [],
    },
  };
}

function buildFinancialSummary(order, carts, fallbackDetail) {
  const cartSubtotal = carts.reduce((sum, cart) => sum + parseAmount(cart?.totalPriceWithTax), 0);
  const total = parseAmount(order?.finalPrice);
  const subtotal = cartSubtotal || parseAmount(fallbackDetail?.financialSummary?.[0]?.value);
  const guestCount = resolveGuestCount(order);

  const summary = [
    {
      label: `Subtotal${subtotal && guestCount ? ` (${guestCount} guests)` : ""}`,
      value: formatCurrency(subtotal),
    },
  ];

  if (total && total !== subtotal) {
    summary.push({
      label: "Total",
      value: formatCurrency(total),
    });
  } else {
    summary.push({
      label: "Total",
      value: formatCurrency(subtotal),
    });
  }

  return summary;
}

export function mapVendorOrderNode(node) {
  const status = normalizeBackendStatus(node?.status);
  const fallback = getFallbackOrderByFriendlyId(node?.id);
  const { dateLabel, timeLabel } = formatDateParts(node?.deliveryDate || node?.placedAt || node?.createdOn);
  const carts = getOrderCartsArray(node?.orderCarts);
  const primaryTitle = normalizeString(carts[0]?.item?.title ?? carts[0]?.item?.name);

  return {
    rawId: normalizeString(node?.id),
    version: toNumber(node?.version, 0),
    id: formatOrderReference(node?.orderNumber, node?.id),
    customer:
      firstNonEmpty(
        node?.customerInfo?.fullName,
        node?.customerName,
        fallback?.customer?.name,
        fallback?.customer,
      ) || "Customer unavailable",
    event: firstNonEmpty(node?.eventName, primaryTitle, fallback?.event, fallback?.orderItem?.name) || "Order",
    guests: resolveGuestCount(node, fallback?.guests || 0),
    date: dateLabel,
    time: timeLabel,
    status: firstNonEmpty(node?.statusLabel, status) || status,
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
    accepted: toNumber(summaryObject.acceptedOrders ?? summaryObject.accepted_orders ?? summaryObject.accepted, rowCount("Accepted")),
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

  const friendlyId = normalizeString(orderId || node?.id);
  const fallback = getFallbackOrderByFriendlyId(friendlyId);
  const carts = getOrderCartsArray(node?.orderCarts);
  const deliveryAddress = {
    address: node?.deliveryAddress,
    addressLine1: node?.deliveryAddress,
    addressLine2: node?.deliverySuite,
    city: node?.deliveryCity,
    postalCode: node?.deliveryPostalCode,
    postCode: node?.deliveryPostalCode,
    fullAddress: node?.deliveryAddressStr,
  };
  const deliveryDate = node?.deliveryDate || node?.placedAt || node?.createdOn;
  const { dateLabel, timeLabel } = formatDateParts(deliveryDate);
  const status = normalizeBackendStatus(node?.status);
  const actions = mapAvailableActionsToUi(node?.availableActions, status);
  const customer = buildCustomerFromApi(node, fallback, deliveryAddress);
  const orderItem = buildOrderItems(carts, fallback);
  const financialSummary =
    Array.isArray(node?.pricingLines) && node.pricingLines.length > 0
      ? node.pricingLines.map((line, index, allLines) => ({
          label: firstNonEmpty(line?.label, `Line ${index + 1}`) || `Line ${index + 1}`,
          value: formatCurrency(line?.amount),
          type: normalizeString(line?.type),
          isTotal:
            normalizeString(line?.type).toLowerCase() === "total" ||
            index === allLines.length - 1,
        }))
      : buildFinancialSummary(node, carts, fallback);
  const fallbackLogistics = fallback?.logistics || {};
  const addOns = Array.isArray(node?.addOns) && node.addOns.length > 0
    ? node.addOns.map((item) => {
        const title = firstNonEmpty(item?.title) || "Add-on";
        const quantity = toNumber(item?.quantity, 0);
        return quantity > 0 ? `${title} x${quantity}` : title;
      })
    : fallback?.addOns || [];

  return {
    rawId: normalizeString(node?.id),
    id: formatOrderReference(node?.orderNumber, node?.id),
    date: dateLabel,
    time: timeLabel,
    guests: resolveGuestCount(node, fallback?.guests || 0),
    status: firstNonEmpty(node?.statusLabel, status) || status,
    statusTone: mapBackendTone(node?.statusTone, status),
    customer,
    orderItem,
    addOns,
    note: firstNonEmpty(node?.specialInstructions, fallback?.note),
    logistics: {
      deliveryAddress:
        normalizeString(deliveryAddress.fullAddress) ||
        normalizeString(deliveryAddress?.address ?? deliveryAddress?.addressLine1) ||
        normalizeString(fallbackLogistics.deliveryAddress) ||
        "Address unavailable",
      eventDate: dateLabel,
      deliveryWindow: firstNonEmpty(node?.eventTime, timeLabel) || "Time unavailable",
      fullAddress:
        [
          normalizeString(deliveryAddress?.address ?? deliveryAddress?.addressLine1),
          normalizeString(deliveryAddress?.addressLine2),
          normalizeString(deliveryAddress?.city),
          normalizeString(deliveryAddress?.postalCode ?? deliveryAddress?.postCode),
        ]
          .filter(Boolean)
          .join(", ") || normalizeString(fallbackLogistics.fullAddress) || "Address unavailable",
      eventType: fallbackLogistics.eventType || orderItem.name || "Order",
      serviceType: normalizeString(node?.paymentType) || fallbackLogistics.serviceType || "Service unavailable",
    },
    financialSummary,
    actions,
    availableActions: node?.availableActions || [],
    statuses: Array.isArray(node?.statuses) ? node.statuses : [],
    adjustments: Array.isArray(node?.adjustments) ? node.adjustments : [],
    raw: {
      ...node,
      orderCarts: carts,
    },
  };
}
