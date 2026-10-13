import assert from "node:assert/strict";
import { test } from "node:test";
import { getOrderFinancialAmounts } from "./orderFinancialAmounts.js";

test("vendor does not add add-ons twice or recalculate included VAT", () => {
  const order = { finalPrice: 22881.60, items: [{ lineTotal: 19068 }] };
  const amounts = getOrderFinancialAmounts(order, {
    subtotal: "18000.00", addOnsTotal: "1068.00", deliveryFee: "0.00",
    tipAmount: "3813.60", grandTotal: "22881.60", taxAmount: "2487.13",
  });
  assert.equal(amounts.baseSubtotal, 18000);
  assert.equal(amounts.addOnsTotal, 1068);
  assert.equal(amounts.taxAmount, 2487.13);
  assert.equal(amounts.grandTotal, 22881.60);
});
test("zero server values and partial payments do not become a larger total", () => {
  const amounts = getOrderFinancialAmounts({ finalPrice: 5000 }, { subtotal: 0, grandTotal: 0, amountDue: 2000 });
  assert.equal(amounts.grandTotal, 0);
  assert.equal(amounts.baseSubtotal, 0);
});
test("legacy subtotal fallback subtracts add-ons once from confirmed total", () => {
  const amounts = getOrderFinancialAmounts({ finalPrice: 22881.60 }, { addOnsTotal: 1068, tipAmount: 3813.60 });
  assert.ok(Math.abs(amounts.baseSubtotal - 18000) < 0.01);
});
