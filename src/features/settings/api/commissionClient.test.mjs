import assert from "node:assert/strict";
import test from "node:test";
import { createVendorCommissionReader, normalizeCommissionRate, hasAppliedVendorCommission } from "./commissionClient.js";

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
  assert.deepEqual(await read(), { effectiveRate: 8, globalRate: 12.75, hasVendorOverride: false });
});

test("global permission denial preserves vendor rate without inventing a global default", async () => {
  const read = createVendorCommissionReader({
    readVendor: async () => ({ me: { vendor: { effectiveCommissionPercentage: 0 } } }),
    readGlobal: async () => { throw new Error("permission denied"); },
  });
  assert.deepEqual(await read(), { effectiveRate: 0, globalRate: null, hasVendorOverride: false });
});

test("a valid global rate never substitutes for a missing applied rate", async () => {
  const read = createVendorCommissionReader({ readVendor: async () => ({ me: { vendor: {} } }), readGlobal: async () => ({ adminCommissionSettings: { globalCommission: { rate: 10 } } }) });
  assert.deepEqual(await read(), { effectiveRate: null, globalRate: 10, hasVendorOverride: false });
});

test("vendor session failures are still reported", async () => {
  const error = new Error("session expired");
  const read = createVendorCommissionReader({ readVendor: async () => { throw error; }, readGlobal: async () => ({}) });
  await assert.rejects(read(), error);
});
test("applied rate requires an active current matching vendor override, including explicit zero", () => {
 const now=Date.parse("2026-11-06T12:00:00Z");
 const vendor={effectiveCommissionPercentage:0};
 assert.equal(hasAppliedVendorCommission(vendor,now),false);
 for (const rule of [{rate:0,isActive:false},{rate:0,isActive:true,effectiveFrom:"2027-01-01"},{rate:0,isActive:true,effectiveTo:"2025-01-01"},{rate:8,isActive:true}]) assert.equal(hasAppliedVendorCommission({...vendor,commissionOverrides:[rule]},now),false);
 assert.equal(hasAppliedVendorCommission({...vendor,commissionOverrides:[{rate:0,isActive:true}]},now),true);
});
