import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import { getVendorOrdersPage } from "../../order/api/orderApi";
import {
  ARCHIVE_VENDOR_NOTIFICATION_MUTATION,
  GET_VENDOR_NOTIFICATION_COUNTS_QUERY,
  GET_VENDOR_NOTIFICATION_DETAIL_QUERY,
  GET_VENDOR_NOTIFICATIONS_QUERY,
  GET_VENDOR_NOTIFICATION_SETTINGS_QUERY,
  MARK_ALL_VENDOR_NOTIFICATIONS_AS_READ_MUTATION,
  MARK_VENDOR_NOTIFICATIONS_AS_READ_MUTATION,
  MARK_VENDOR_NOTIFICATION_AS_READ_MUTATION,
  UPDATE_VENDOR_NOTIFICATION_SETTINGS_MUTATION,
} from "./notificationsQueries";

const SYNTHETIC_ORDER_NOTIFICATION_PREFIX = "vendor-order-notification:";
const VENDOR_ORDER_NOTIFICATION_STATE_KEY = "vendor-order-notification-state";

function unwrapMutationResult(result, key, fallbackMessage) {
  const payload = result?.[key];

  if (!payload?.success) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

function readVendorOrderNotificationState() {
  if (typeof window === "undefined") {
    return {
      readIds: [],
      readAllBefore: "",
    };
  }

  try {
    const rawValue = window.localStorage.getItem(VENDOR_ORDER_NOTIFICATION_STATE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : {};

    return {
      readIds: Array.isArray(parsedValue?.readIds)
        ? parsedValue.readIds.filter(Boolean)
        : [],
      readAllBefore: String(parsedValue?.readAllBefore || ""),
    };
  } catch {
    return {
      readIds: [],
      readAllBefore: "",
    };
  }
}

function writeVendorOrderNotificationState(nextState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    VENDOR_ORDER_NOTIFICATION_STATE_KEY,
    JSON.stringify({
      readIds: Array.isArray(nextState?.readIds) ? nextState.readIds : [],
      readAllBefore: String(nextState?.readAllBefore || ""),
    }),
  );
}

function buildSyntheticOrderNotificationId(orderId) {
  return `${SYNTHETIC_ORDER_NOTIFICATION_PREFIX}${orderId || ""}`;
}

function isSyntheticOrderNotificationId(id) {
  return String(id || "").startsWith(SYNTHETIC_ORDER_NOTIFICATION_PREFIX);
}

function getSyntheticOrderNotificationOrderId(id) {
  return String(id || "").replace(SYNTHETIC_ORDER_NOTIFICATION_PREFIX, "");
}

function isOrderNotificationRead(order, notificationState) {
  const readIds = Array.isArray(notificationState?.readIds) ? notificationState.readIds : [];
  const readAllBefore = String(notificationState?.readAllBefore || "");
  const createdOn = String(order?.createdOn || "");
  const syntheticId = buildSyntheticOrderNotificationId(order?.id);

  if (readIds.includes(syntheticId)) {
    return true;
  }

  if (!readAllBefore || !createdOn) {
    return false;
  }

  const createdOnTime = new Date(createdOn).getTime();
  const readAllBeforeTime = new Date(readAllBefore).getTime();

  if (Number.isNaN(createdOnTime) || Number.isNaN(readAllBeforeTime)) {
    return false;
  }

  return createdOnTime <= readAllBeforeTime;
}

function isOrderLikeNotification(node) {
  const rawType = String(node?.notificationType || node?.type || "").toUpperCase();

  return (
    rawType === "NEW_ORDER" ||
    rawType === "ORDER_UPDATE" ||
    rawType === "VENDOR_PRODUCT_ORDERED" ||
    rawType === "ORDER"
  );
}

function isNewOrder(order) {
  const status = String(order?.status || order?.statusLabel || "").trim().toUpperCase();
  return ["NEW", "PENDING", "PLACED"].includes(status);
}

function buildSyntheticOrderNotificationNode(order, notificationState) {
  const customerName = String(order?.customerName || "").trim();
  const orderNumber = String(order?.orderNumber || order?.invoiceNumber || order?.id || "").trim();
  const eventName = String(order?.eventName || "").trim();
  const amount = Number(order?.pricing?.grandTotal ?? 0);
  const isRead = isOrderNotificationRead(order, notificationState);
  const message = [
    customerName ? `${customerName} placed` : "A customer placed",
    orderNumber ? `order ${orderNumber}` : "a new order",
    eventName ? `for ${eventName}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: buildSyntheticOrderNotificationId(order?.id),
    type: "NEW_ORDER",
    notificationType: "NEW_ORDER",
    audience: "VENDOR",
    title: "New order received",
    message: `${message}.`,
    isRead,
    createdAt: order?.createdOn || new Date().toISOString(),
    orderId: order?.id || "",
    orderNumber,
    actorName: customerName,
    order: {
      id: order?.id || "",
      orderNumber,
      status: order?.status || "",
      customerName,
      amount: Number.isFinite(amount) ? amount : "",
      currency: "NOK",
      itemsSummary: eventName,
      items: [],
    },
  };
}

function filterSyntheticNotificationsByStatus(items, status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "UNREAD") {
    return items.filter((item) => !item.isRead);
  }

  if (normalizedStatus === "READ") {
    return items.filter((item) => item.isRead);
  }

  return items;
}

async function fetchSyntheticOrderNotificationNodes(variables = {}) {
  const notificationState = readVendorOrderNotificationState();
  const ordersResponse = await getVendorOrdersPage({
    first: Math.max(20, Number(variables?.first ?? 20) || 20),
    after: null,
    search: null,
    status: null,
    datePreset: variables?.datePreset || null,
    dateFrom: variables?.dateFrom || null,
    dateTo: variables?.dateTo || null,
  });

  const orderEdges = Array.isArray(ordersResponse?.vendorOrders?.edges)
    ? ordersResponse.vendorOrders.edges
    : [];

  const syntheticItems = orderEdges
    .map((edge) => edge?.node)
    .filter((node) => node?.id && isNewOrder(node))
    .map((order) => buildSyntheticOrderNotificationNode(order, notificationState));

  return filterSyntheticNotificationsByStatus(syntheticItems, variables?.status);
}

function mergeVendorNotificationConnections(financeConnection, syntheticNodes) {
  const financeEdges = Array.isArray(financeConnection?.edges)
    ? financeConnection.edges.filter(Boolean)
    : [];
  const orderReferencesAlreadyInFeed = new Set(
    financeEdges
      .map((edge) => edge?.node)
      .filter(isOrderLikeNotification)
      .flatMap((node) => [node?.orderId, node?.order?.id, node?.orderNumber])
      .filter(Boolean)
      .map(String),
  );

  const syntheticEdges = syntheticNodes
    .filter(
      (node) =>
        !orderReferencesAlreadyInFeed.has(String(node?.orderId || "")) &&
        !orderReferencesAlreadyInFeed.has(String(node?.orderNumber || "")),
    )
    .map((node) => ({
      cursor: `synthetic:${node.id}`,
      node,
    }));

  const mergedEdges = [...financeEdges, ...syntheticEdges].sort((left, right) => {
    const leftTime = new Date(left?.node?.createdAt || 0).getTime();
    const rightTime = new Date(right?.node?.createdAt || 0).getTime();
    return rightTime - leftTime;
  });

  const unreadCount = mergedEdges.reduce(
    (count, edge) => count + (edge?.node?.isRead ? 0 : 1),
    0,
  );

  return {
    ...financeConnection,
    edges: mergedEdges,
    totalCount: mergedEdges.length,
    unreadCount,
  };
}

export async function getVendorNotifications(variables) {
  const [financeResult, syntheticOrderNodes] = await Promise.all([
    executeProtectedGraphqlRequest(GET_VENDOR_NOTIFICATIONS_QUERY, variables),
    fetchSyntheticOrderNotificationNodes(variables).catch(() => []),
  ]);

  return {
    ...financeResult,
    vendorFinanceNotifications: mergeVendorNotificationConnections(
      financeResult?.vendorFinanceNotifications,
      syntheticOrderNodes,
    ),
  };
}

export function getVendorNotificationDetail(id) {
  return executeProtectedGraphqlRequest(GET_VENDOR_NOTIFICATION_DETAIL_QUERY, { id });
}

export function getVendorNotificationCounts() {
  return executeProtectedGraphqlRequest(GET_VENDOR_NOTIFICATION_COUNTS_QUERY, {});
}

export async function markVendorNotificationAsRead(id) {
  if (isSyntheticOrderNotificationId(id)) {
    const currentState = readVendorOrderNotificationState();
    const nextReadIds = Array.from(
      new Set([...currentState.readIds, buildSyntheticOrderNotificationId(getSyntheticOrderNotificationOrderId(id))]),
    );

    writeVendorOrderNotificationState({
      ...currentState,
      readIds: nextReadIds,
    });

    return {
      success: true,
      message: "Notification marked as read.",
      notification: {
        id,
        isRead: true,
      },
      unreadCount: null,
    };
  }

  const result = await executeProtectedGraphqlRequest(
    MARK_VENDOR_NOTIFICATION_AS_READ_MUTATION,
    { id },
  );
  const payload = result?.markFinanceNotificationRead;

  if (!payload?.success || !payload?.notification?.id) {
    throw new Error(payload?.message || "Unable to mark the notification as read.");
  }

  return {
    success: true,
    message: payload.message || "Notification marked as read.",
    notification: payload.notification,
    unreadCount: null,
  };
}

export async function markVendorNotificationsAsRead(ids) {
  const syntheticIds = Array.isArray(ids)
    ? ids.filter((id) => isSyntheticOrderNotificationId(id))
    : [];

  if (syntheticIds.length > 0) {
    const currentState = readVendorOrderNotificationState();
    writeVendorOrderNotificationState({
      ...currentState,
      readIds: Array.from(new Set([...currentState.readIds, ...syntheticIds])),
    });
  }

  return markAllVendorNotificationsAsRead();
}

export async function markAllVendorNotificationsAsRead() {
  const result = await executeProtectedGraphqlRequest(
    MARK_ALL_VENDOR_NOTIFICATIONS_AS_READ_MUTATION,
    {},
  );
  const payload = result?.markAllFinanceNotificationsRead;

  if (!payload?.success) {
    throw new Error(payload?.message || "Unable to mark all notifications as read.");
  }

  const currentState = readVendorOrderNotificationState();
  writeVendorOrderNotificationState({
    ...currentState,
    readAllBefore: new Date().toISOString(),
  });

  return {
    success: true,
    message: payload.message || "All notifications marked as read.",
    unreadCount: 0,
  };
}

export async function archiveVendorNotification(id) {
  void id;
  const result = await executeProtectedGraphqlRequest(ARCHIVE_VENDOR_NOTIFICATION_MUTATION, {});
  const payload = result?.markAllFinanceNotificationsRead;

  if (!payload?.success) {
    throw new Error(payload?.message || "Unable to update the notification.");
  }

  return {
    success: true,
    message: payload.message || "Notification updated.",
  };
}

export function getVendorNotificationSettings() {
  return executeProtectedGraphqlRequest(GET_VENDOR_NOTIFICATION_SETTINGS_QUERY, {});
}

export async function updateVendorNotificationSettings(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_NOTIFICATION_SETTINGS_MUTATION,
    { input },
  );

  return unwrapMutationResult(
    result,
    "updateVendorNotificationSettings",
    "Unable to update notification settings.",
  );
}
