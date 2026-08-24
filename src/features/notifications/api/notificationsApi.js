import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
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

function getUnreadCount(connection) {
  return Number(connection?.unreadCount ?? 0) || 0;
}

function unwrapMutationResult(result, key, fallbackMessage) {
  const payload = result?.[key];

  if (!payload?.success) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export function getVendorNotifications(variables) {
  return executeProtectedGraphqlRequest(GET_VENDOR_NOTIFICATIONS_QUERY, variables);
}

export function getVendorNotificationDetail(id) {
  return executeProtectedGraphqlRequest(GET_VENDOR_NOTIFICATION_DETAIL_QUERY, { id });
}

export function getVendorNotificationCounts() {
  return executeProtectedGraphqlRequest(GET_VENDOR_NOTIFICATION_COUNTS_QUERY, {});
}

export async function markVendorNotificationAsRead(id) {
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
  void ids;
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
