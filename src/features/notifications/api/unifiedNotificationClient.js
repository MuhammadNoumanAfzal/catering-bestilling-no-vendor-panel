export const VENDOR_UNIFIED_QUERY = `query VendorUnifiedNotifications($first: Int!, $after: String, $filter: MyNotificationsFilterInput) {
 myNotifications(first:$first,after:$after,filter:$filter) { edges { cursor node { id type title message isRead isArchived createdAt entity { entityType entityId actionUrl } } } pageInfo { endCursor hasNextPage totalCount } counts { total unread read archived highPriority } }
 myNotificationUnreadCount { count }
}`;
export function createVendorNotificationClient(request) {
 const checkedCount = value => { if (!Number.isSafeInteger(value) || value < 0) throw Error("Invalid notification count."); return value; };
 async function feed(variables = {}) {
  const filter = { status: variables.status || "ALL" };
  if (variables.dateFrom) filter.dateFrom = variables.dateFrom + "T00:00:00Z";
  if (variables.dateTo) filter.dateTo = variables.dateTo + "T23:59:59.999Z";
  const data = await request(VENDOR_UNIFIED_QUERY, { first: variables.first || 20, after: variables.after || null, filter });
  const connection = data?.myNotifications;
  if (!Array.isArray(connection?.edges) || !connection.pageInfo) throw Error("Unable to load notifications.");
  return { vendorFinanceNotifications: { ...connection, totalCount: checkedCount(connection.pageInfo.totalCount), unreadCount: checkedCount(data?.myNotificationUnreadCount?.count), edges: connection.edges.map(edge => ({ ...edge, node: { ...edge.node, orderId: edge.node?.entity?.entityType === "ORDER" ? edge.node.entity.entityId : "", entity: edge.node?.entity } })) } };
 }
 async function mutate(query, key, variables) {
  const payload = (await request(query, variables))?.[key];
  if (!payload?.success) throw Error(payload?.message || "Unable to update notification.");
  return payload;
 }
 return {
  feed,
  counts: () => feed({ first: 1, status: "UNREAD" }),
  async read(id) {
   const payload = await mutate(`mutation VendorReadNotification($id:ID!){markNotificationRead(id:$id){success message notification{id isRead}}}`, "markNotificationRead", {id});
   if (!payload.notification?.isRead || String(payload.notification.id) !== String(id)) throw Error("Unable to mark notification as read.");
   return {...payload, unreadCount:null};
  },
  async readAll() { return mutate(`mutation VendorReadAllNotifications{markAllMyNotificationsRead{success message updatedCount}}`, "markAllMyNotificationsRead", {}); },
  archive: id => mutate(`mutation VendorArchiveNotification($id:ID!){archiveNotification(id:$id){success message}}`, "archiveNotification", {id}),
  unarchive: id => mutate(`mutation VendorRestoreNotification($id:ID!){unarchiveNotification(id:$id){success message}}`, "unarchiveNotification", {id}),
 };
}
