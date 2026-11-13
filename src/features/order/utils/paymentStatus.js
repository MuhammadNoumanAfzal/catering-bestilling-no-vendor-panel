export function customerPaymentStatus(order) {
  return String(order?.customerPaymentStatus || "").trim().toUpperCase();
}
export function isCustomerPaymentCleared(order) {
  return customerPaymentStatus(order) === "PAID";
}

export function isCustomerPaymentReserved(order) { return customerPaymentStatus(order) === "AUTHORIZED"; }
