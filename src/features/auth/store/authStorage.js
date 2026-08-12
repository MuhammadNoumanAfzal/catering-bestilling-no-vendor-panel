import { isAllowedAuthRole } from "../authConfig";

const AUTH_STORAGE_KEY = "vendor-panel-auth";

function isVendorSessionAllowed(user) {
  const applicationStatus = `${user?.applicationStatus ?? ""}`.trim().toUpperCase();
  const vendorStatus = `${user?.vendorStatus ?? user?.status ?? ""}`.trim().toUpperCase();

  if (!user?.isActive) {
    return false;
  }

  if (applicationStatus && !["ACTIVE", "APPROVED"].includes(applicationStatus)) {
    return false;
  }

  if (vendorStatus && !["ACTIVE", "APPROVED"].includes(vendorStatus)) {
    return false;
  }

  return true;
}

export function loadStoredAuthSession() {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      user: null,
    };
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
      return {
        accessToken: null,
        user: null,
      };
    }

    const parsedSession = JSON.parse(rawSession);
    const accessToken = parsedSession.accessToken || null;
    const user = parsedSession.user || null;

    if (
      !accessToken ||
      !user?.id ||
      !user?.email ||
      !isAllowedAuthRole(user?.role) ||
      !isVendorSessionAllowed(user)
    ) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return {
        accessToken: null,
        user: null,
      };
    }

    return {
      accessToken,
      user,
    };
  } catch {
    return {
      accessToken: null,
      user: null,
    };
  }
}

export function persistAuthSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  if (
    !session?.accessToken ||
    !session?.user ||
    !isAllowedAuthRole(session.user.role) ||
    !isVendorSessionAllowed(session.user)
  ) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
