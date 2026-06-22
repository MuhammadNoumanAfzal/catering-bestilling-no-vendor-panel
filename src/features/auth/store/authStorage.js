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

    return {
      accessToken: parsedSession.accessToken || null,
      user: parsedSession.user || null,
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

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
