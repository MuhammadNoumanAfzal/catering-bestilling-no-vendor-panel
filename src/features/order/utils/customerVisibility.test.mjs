import test from "node:test";
import assert from "node:assert/strict";
import { canShowCustomerContact, redactUnacceptedContact } from "./customerVisibility.js";

test("unaccepted orders never reveal contact details", () => {
  for (const status of ["NEW", "PENDING", "PLACED", "REJECTED", "CANCELLED"]) {
    assert.equal(canShowCustomerContact({ status }), false, status);
  }
  assert.equal(canShowCustomerContact({ status: "NEW", customerDetailsVisible: true }), false);
  assert.equal(canShowCustomerContact(null), false);
});

test("accepted orders and later fulfillment stages reveal contact details", () => {
  for (const status of ["ACCEPTED", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]) {
    assert.equal(canShowCustomerContact({ status }), true, status);
  }
  assert.equal(canShowCustomerContact({ status: "MODIFIED", statuses: [{ status: "CONFIRMED" }] }), true);
  assert.equal(canShowCustomerContact({ status: "CANCELLED", acceptedAt: "2026-10-22" }), true);
});

test("explicit backend privacy denial overrides acceptance", () => {
  assert.equal(canShowCustomerContact({
    status: "ACCEPTED", customerDetailsVisible: false,
    acceptedAt: "2026-10-22", statuses: [{ status: "CONFIRMED" }],
  }), false);
});

test("redaction removes identity while retaining order and location data", () => {
  const order = {
    id: "29", status: "NEW", customerName: "Test Customer",
    email: "test@example.com", phone: "12345678", corporateName: "Test Company",
    customerInfo: { fullName: "Test Customer", email: "test@example.com",
      phone: "12345678", organization: "Test Company", city: "Oslo" },
  };
  const result = redactUnacceptedContact(order);
  for (const key of ["customerName", "email", "phone", "corporateName"]) {
    assert.equal(result[key], "");
  }
  for (const key of ["fullName", "email", "phone", "organization"]) {
    assert.equal(result.customerInfo[key], "");
  }
  assert.equal(result.id, "29");
  assert.equal(result.customerInfo.city, "Oslo");
  assert.equal(order.customerName, "Test Customer");
  const accepted = { ...order, status: "CONFIRMED" };
  assert.equal(redactUnacceptedContact(accepted), accepted);
});
