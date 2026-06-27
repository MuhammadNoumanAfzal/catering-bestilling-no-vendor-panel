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

  return unwrapMutationResult(
    result,
    "markVendorNotificationAsRead",
    "Unable to mark the notification as read.",
  );
}

export async function markVendorNotificationsAsRead(ids) {
  const result = await executeProtectedGraphqlRequest(
    MARK_VENDOR_NOTIFICATIONS_AS_READ_MUTATION,
    { ids },
  );

  return unwrapMutationResult(
    result,
    "markVendorNotificationsAsRead",
    "Unable to mark notifications as read.",
  );
}

export async function markAllVendorNotificationsAsRead() {
  const result = await executeProtectedGraphqlRequest(
    MARK_ALL_VENDOR_NOTIFICATIONS_AS_READ_MUTATION,
    {},
  );

  return unwrapMutationResult(
    result,
    "markAllVendorNotificationsAsRead",
    "Unable to mark all notifications as read.",
  );
}

export async function archiveVendorNotification(id) {
  const result = await executeProtectedGraphqlRequest(
    ARCHIVE_VENDOR_NOTIFICATION_MUTATION,
    { id },
  );

  return unwrapMutationResult(
    result,
    "archiveVendorNotification",
    "Unable to archive the notification.",
  );
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
