import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMoney, parseMoney } from "./formatMoney.js";
import { mapVendorReviewNode } from "../features/reviews/api/reviewsMappers.js";

test("whole kroner use the same display format as the client", () => {
  assert.equal(formatMoney(680), "680,-");
  assert.equal(formatMoney(5000), "5 000,-");
  assert.equal(formatMoney(0), "0,-");
  assert.equal(formatMoney(-680), "-680,-");
  assert.equal(formatMoney("680.00"), "680,-");
});

test("fractional totals preserve real ore amounts", () => {
  assert.equal(formatMoney(680.5), "680,50");
  assert.equal(formatMoney(652.17), "652,17");
  assert.equal(formatMoney(679.999), "680,-");
  assert.equal(parseMoney("680,50"), 680.5);
  assert.equal(parseMoney("-680,50"), -680.5);
});

test("formatted API money is normalized without changing totals", () => {
  for (const value of ["5 000,-", "5\u00a0000,-", "NOK 5,000.00", "kr 5.000,00", { amount: "5000.00", formatted: "NOK 5,000.00" }]) {
    assert.equal(parseMoney(value), 5000);
    assert.equal(formatMoney(value), "5 000,-");
  }
  assert.equal(formatMoney({ formatted: "kr 680.50" }), "680,50");
  assert.equal(formatMoney(null), "0,-");
  assert.equal(formatMoney(NaN), "0,-");
});

test("review order prices use the shared formatter", () => {
  assert.equal(mapVendorReviewNode({ orderAmount: "680.00" }).orderAmount, "680,-");
  assert.equal(mapVendorReviewNode({ orderAmount: "kr 680.50" }).orderAmount, "680,50");
  assert.equal(mapVendorReviewNode({ orderAmount: "" }).orderAmount, "");
});
