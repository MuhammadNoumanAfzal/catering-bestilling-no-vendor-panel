import { isAllowedAuthRole } from "../authConfig";

const AUTH_STORAGE_KEY = "vendor-panel-auth";

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

    if (!accessToken || !user?.id || !user?.email || !isAllowedAuthRole(user?.role) || !user?.isActive) {
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

  if (!session?.accessToken || !session?.user || !isAllowedAuthRole(session.user.role)) {
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
