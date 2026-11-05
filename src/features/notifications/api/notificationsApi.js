import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import { translateNotificationText } from "../notificationTranslations";
import { GET_VENDOR_NOTIFICATION_SETTINGS_QUERY, UPDATE_VENDOR_NOTIFICATION_SETTINGS_MUTATION } from "./notificationsQueries";
import { createVendorNotificationClient } from "./unifiedNotificationClient.js";
const client = createVendorNotificationClient(executeProtectedGraphqlRequest);
function unwrapMutationResult(result,key,message) { const payload=result?.[key]; if(!payload?.success)throw Error(payload?.message||message);return payload; }
export const getVendorNotifications = client.feed;
export const getVendorNotificationCounts = client.counts;
export const markVendorNotificationAsRead = client.read;
export const archiveVendorNotification = client.archive;
export const unarchiveVendorNotification = client.unarchive;
export async function markAllVendorNotificationsAsRead() {
 const payload=await client.readAll();const result=await client.counts();return {...payload,unreadCount:result.vendorFinanceNotifications.unreadCount};
}
export async function markVendorNotificationsAsRead(ids) { await Promise.all([...new Set(ids || [])].map(client.read)); return {success:true, unreadCount:null}; }
export async function getVendorNotificationDetail(id) {
 const data=await executeProtectedGraphqlRequest(`query VendorNotificationDetail($id:ID!){notification(id:$id){id type title message isRead isArchived createdAt entity{entityType entityId actionUrl}}}`,{id});
 return {financeNotification:data?.notification};
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
    translateNotificationText("Unable to update notification settings."),
  );
}
