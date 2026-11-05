export function customerPaymentStatus(order) {
  return String(order?.customerPaymentStatus || "").trim().toUpperCase();
}
export function isCustomerPaymentCleared(order) {
  return customerPaymentStatus(order) === "PAID";
}
