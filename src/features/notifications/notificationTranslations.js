import i18n from "../../i18n";

const messageKeys = {
  "all": "all",
  "unread": "unread",
  "read": "read",
  "today": "today",
  "yesterday": "yesterday",
  "older": "older",
  "last 7 days": "last7",
  "last 30 days": "last30",
  "this month": "thisMonth",
  "last month": "lastMonth",
  "custom date": "custom",
  "just now": "justNow",
  "order notification": "orderNotification",
  "review notification": "reviewNotification",
  "payout notification": "payoutNotification",
  "notification": "notification",
  "new order received": "newOrder",
  "title": "titleLabel",
  "message": "messageLabel",
  "order": "order",
  "order id": "orderId",
  "review id": "reviewId",
  "created": "created",
  "type": "type",
  "review": "review",
  "payout": "payout",
  "alert": "alert",
  "view receipt": "viewReceipt",
  "view detail": "viewDetail",
  "reviewer": "reviewer",
  "rating": "rating",
  "occasion": "occasion",
  "comment": "comment",
  "close": "close",
  "payment receipt": "receipt",
  "amount received": "amountReceived",
  "loading...": "loading",
  "download": "download",
  "done": "done",
  "status": "status",
  "stage": "stage",
  "customer": "customer",
  "requested by": "requestedBy",
  "amount": "amount",
  "order details": "orderDetails",
  "order preview not available": "noPreview",
  "status:": "statusColon",
  "customer:": "customerColon",
  "order id:": "orderIdColon",
  "items": "items",
  "item": "item",
  "no extra description provided.": "noDescription",
  "allergens:": "allergens",
  "none": "none",
  "order item details are not available for this notification yet.": "noItems",
  "unable to load notifications right now.": "loadError",
  "notifications unavailable": "unavailable",
  "all notifications marked as read.": "allRead",
  "unable to mark notifications as read.": "readError",
  "unable to load more notifications.": "moreError",
  "notification marked as read.": "oneRead",
  "unable to mark the notification as read.": "oneReadError",
  "unable to mark all notifications as read.": "allReadError",
  "unable to update the notification.": "updateError",
  "notification updated.": "updated",
  "unable to update notification settings.": "settingsError",
  "pending": "pending",
  "paid": "paid",
  "released": "released",
  "completed": "completed",
  "accepted": "accepted",
  "preparing": "preparing",
  "ready": "ready",
  "out for delivery": "outForDelivery",
  "delivered": "delivered",
  "canceled": "canceled"
};

export function translateNotificationText(value) {
  if (typeof value !== "string") return value;
  const key = messageKeys[value.trim().toLowerCase()];
  return key ? i18n.t(`notifications.messages.${key}`) : value;
}

export function formatNotificationTime(value) {
  const text = String(value || "");
  const match = text.trim().match(/^(\d+)\s+(min|minute|hour|day|week|month|year)s?\s+ago$/i);
  if (!match) return translateNotificationText(text);
  const unit = match[2].toLowerCase() === "min" ? "minute" : match[2].toLowerCase();
  return new Intl.RelativeTimeFormat(i18n.language === "nb" ? "nb-NO" : "en-GB", { numeric: "always" }).format(-Number(match[1]), unit);
}

export function notificationMessage(notification) {
  if (!notification.generatedOrder) return translateNotificationText(notification.message);
  const values = notification.generatedOrder;
  return i18n.t(values.event ? "notifications.newOrderBodyEvent" : "notifications.newOrderBody", {
    ...values,
    customer: values.customer || i18n.t("notifications.customerFallback"),
  });
}
