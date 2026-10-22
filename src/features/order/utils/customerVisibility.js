const ACCEPTED_STAGES = new Set([
  "accepted", "confirmed", "confirm", "preparing", "inpreparation", "inkitchen",
  "ready", "foodready", "foodisready", "readyfordispatch", "readyfordelivery",
  "outfordelivery", "intransit", "delivered", "completed", "complete",
]);

function acceptedStage(value) {
  return ACCEPTED_STAGES.has(String(value || "").toLowerCase().replace(/[^a-z]/g, ""));
}

export function canShowCustomerContact(order) {
  if (!order || order.customerDetailsVisible === false) return false;
  if (order.acceptedAt || order.confirmedAt) return true;
  if (acceptedStage(order.status) || acceptedStage(order.statusLabel)) return true;
  return Array.isArray(order.statuses) && order.statuses.some((entry) => acceptedStage(entry?.status));
}

export function redactUnacceptedContact(order) {
  if (canShowCustomerContact(order)) return order;
  return { ...order, customerName: "", email: "", phone: "", corporateName: "",
    customerInfo: { ...order?.customerInfo, fullName: "", email: "", phone: "", organization: "" } };
}
