const STORAGE_KEY = "vendor_pending_order_adjustments";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeId(value) {
  return value == null ? "" : String(value).trim();
}

function decodeRelayId(value) {
  const normalizedValue = normalizeId(value);
  if (!normalizedValue) {
    return "";
  }

  try {
    let base64Value = normalizedValue;
    while (base64Value.length % 4 !== 0) {
      base64Value += "=";
    }

    const decodedValue = atob(base64Value);
    if (!decodedValue.includes(":")) {
      return "";
    }

    const parts = decodedValue.split(":").map((part) => normalizeId(part));
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

function buildIdAliases(orderId) {
  const normalizedId = normalizeId(orderId);
  const decodedRelayId = decodeRelayId(normalizedId);

  return Array.from(
    new Set([normalizedId, decodedRelayId].filter(Boolean)),
  );
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
  const aliases = buildIdAliases(orderId);
  if (aliases.length === 0) {
    return null;
  }

  const store = readStore();
  for (const alias of aliases) {
    if (store[alias]) {
      return store[alias];
    }
  }

  return null;
}

export function savePendingAdjustment(orderId, adjustment) {
  const aliases = buildIdAliases(orderId);
  if (aliases.length === 0 || !adjustment || typeof adjustment !== "object") {
    return;
  }

  const store = readStore();
  const primaryId = aliases[0];
  const nextValue = {
    ...adjustment,
    orderId: primaryId,
    savedAt: adjustment.savedAt || new Date().toISOString(),
  };

  aliases.forEach((alias) => {
    store[alias] = nextValue;
  });

  writeStore(store);
}

export function clearPendingAdjustment(orderId) {
  const aliases = buildIdAliases(orderId);
  if (aliases.length === 0) {
    return;
  }

  const store = readStore();
  aliases.forEach((alias) => {
    delete store[alias];
  });
  writeStore(store);
}
