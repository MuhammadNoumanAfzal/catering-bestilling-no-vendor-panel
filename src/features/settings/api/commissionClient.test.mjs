import assert from "node:assert/strict";
import test from "node:test";
import { createVendorCommissionReader, normalizeCommissionRate } from "./commissionClient.js";

test("zero and decimal global rates remain accurate; missing/invalid values never become zero", () => {
  assert.equal(normalizeCommissionRate(0), 0);
  assert.equal(normalizeCommissionRate("12.75"), 12.75);
  for (const value of [null, undefined, "", " ", true, -1, 101, "unknown", Infinity]) assert.equal(normalizeCommissionRate(value), null);
});

test("admin global rate and self-vendor applied rate remain separate", async () => {
  const read = createVendorCommissionReader({
    readVendor: async (query) => { assert.match(query, /me\s*\{\s*vendor/); return { me: { vendor: { effectiveCommissionPercentage: 8 } } }; },
    readGlobal: async (query) => { assert.match(query, /globalCommission\s*\{\s*rate\s*\}/); assert.doesNotMatch(query, /vendorCommissions|areaCommissions|updatedBy/); return { adminCommissionSettings: { globalCommission: { rate: "12.75" } } }; },
  });
  assert.deepEqual(await read(), { effectiveRate: 8, globalRate: 12.75 });
});

test("global permission denial preserves vendor rate without inventing a global default", async () => {
  const read = createVendorCommissionReader({
    readVendor: async () => ({ me: { vendor: { effectiveCommissionPercentage: 0 } } }),
    readGlobal: async () => { throw new Error("permission denied"); },
  });
  assert.deepEqual(await read(), { effectiveRate: 0, globalRate: null });
});

test("a valid global rate never substitutes for a missing applied rate", async () => {
  const read = createVendorCommissionReader({ readVendor: async () => ({ me: { vendor: {} } }), readGlobal: async () => ({ adminCommissionSettings: { globalCommission: { rate: 10 } } }) });
  assert.deepEqual(await read(), { effectiveRate: null, globalRate: 10 });
});

test("vendor session failures are still reported", async () => {
  const error = new Error("session expired");
  const read = createVendorCommissionReader({ readVendor: async () => { throw error; }, readGlobal: async () => ({}) });
  await assert.rejects(read(), error);
});