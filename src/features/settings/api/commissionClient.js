export const VENDOR_RATE_QUERY = `
  query VendorSettingsCommission {
    me { vendor { effectiveCommissionPercentage commissionOverrides { rate isActive effectiveFrom effectiveTo } } }
  }
`;

// Reuse the admin query's global rate only, never its vendor/area overrides.
export const GLOBAL_RATE_QUERY = `
  query VendorGlobalCommissionDisplay {
    adminCommissionSettings { globalCommission { rate } }
  }
`;

export function normalizeCommissionRate(value) {
  if (value === null || value === undefined || typeof value === "boolean" || String(value).trim() === "") return null;
  const rate = Number(value);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : null;
}

export function createVendorCommissionReader({ readVendor, readGlobal }) {
  return async function getVendorCommission() {
    const [vendor, global] = await Promise.allSettled([
      readVendor(VENDOR_RATE_QUERY, {}),
      readGlobal(GLOBAL_RATE_QUERY, {}),
    ]);
    if (vendor.status === "rejected") throw vendor.reason;
    return {
      effectiveRate: normalizeCommissionRate(vendor.value?.me?.vendor?.effectiveCommissionPercentage),
      hasVendorOverride: hasAppliedVendorCommission(vendor.value?.me?.vendor),
      globalRate: global.status === "fulfilled"
        ? normalizeCommissionRate(global.value?.adminCommissionSettings?.globalCommission?.rate)
        : null,
    };
  };
}
export function hasAppliedVendorCommission(vendor, now = Date.now()) {
 const rate = normalizeCommissionRate(vendor?.effectiveCommissionPercentage);
 return rate !== null && Array.isArray(vendor?.commissionOverrides) && vendor.commissionOverrides.some(rule => {
  if (rule.isActive !== true || normalizeCommissionRate(rule.rate) !== rate) return false;
  const start = rule.effectiveFrom ? Date.parse(rule.effectiveFrom) : -Infinity;
  const end = rule.effectiveTo ? Date.parse(rule.effectiveTo) : Infinity;
  return start <= now && now <= end;
 });
}
