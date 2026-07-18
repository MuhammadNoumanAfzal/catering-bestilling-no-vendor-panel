export const VENDOR_PROFILE_UPDATED_EVENT = "vendor-profile-updated";

function normalizeString(value) {
  return value == null ? "" : String(value).trim();
}

export function withImageCacheBuster(url, version = Date.now()) {
  const normalizedUrl = normalizeString(url);

  if (!normalizedUrl) {
    return "";
  }

  const separator = normalizedUrl.includes("?") ? "&" : "?";
  return `${normalizedUrl}${separator}cb=${version}`;
}

export function dispatchVendorProfileUpdated(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(VENDOR_PROFILE_UPDATED_EVENT, {
      detail: {
        profileImageUrl: normalizeString(detail.profileImageUrl),
        version: detail.version || Date.now(),
      },
    }),
  );
}
