export function resolveVendorNotificationTarget(notification) {
  const type = String(notification?.rawType || notification?.type || "").toUpperCase();
  if (/PAYOUT|PAYMENT|SETTLEMENT|INVOICE|COMMISSION/.test(type)) return "/finance";
  if (/SUPPORT|TICKET/.test(type)) return "/support/responses";
  if (/REVIEW|RATING/.test(type)) return "/reviews";
  if (/ORDER/.test(type)) {
    const id = notification?.orderId || notification?.livePayload?.order?.id;
    return id ? "/orders/" + encodeURIComponent(id) : "/orders";
  }
  if (/MENU|PRODUCT|ADD_ON/.test(type)) return "/menu";
  if (/DELIVERY/.test(type)) return "/delivery";
  if (/VENDOR|ACCOUNT|PROFILE|SETTING|VERIFICATION/.test(type)) return "/settings";
  if (notification?.payoutId || notification?.invoiceId) return "/finance";
  if (notification?.reviewId) return "/reviews";
  if (notification?.orderId) return "/orders/" + encodeURIComponent(notification.orderId);
  return null;
}
