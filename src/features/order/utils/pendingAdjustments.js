const STORAGE_KEY = "vendor_pending_order_adjustments";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeId(value) {
  return value == null ? "" : String(value).trim();
}

function readStore() {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors.
  }
}

export function getPendingAdjustment(orderId) {
  const normalizedId = normalizeId(orderId);
  if (!normalizedId) {
    return null;
  }

  const store = readStore();
  return store[normalizedId] || null;
}

export function savePendingAdjustment(orderId, adjustment) {
  const normalizedId = normalizeId(orderId);
  if (!normalizedId || !adjustment || typeof adjustment !== "object") {
    return;
  }

  const store = readStore();
  store[normalizedId] = {
    ...adjustment,
    orderId: normalizedId,
    savedAt: adjustment.savedAt || new Date().toISOString(),
  };
  writeStore(store);
}

export function clearPendingAdjustment(orderId) {
  const normalizedId = normalizeId(orderId);
  if (!normalizedId) {
    return;
  }

  const store = readStore();
  if (!store[normalizedId]) {
    return;
  }

  delete store[normalizedId];
  writeStore(store);
}
