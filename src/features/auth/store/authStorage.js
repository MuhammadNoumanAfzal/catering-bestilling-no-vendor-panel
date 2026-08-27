import { isAllowedAuthRole } from "../authConfig";

const PERSISTENT_AUTH_STORAGE_KEY = "vendor-panel-auth-persistent";
const SESSION_AUTH_STORAGE_KEY = "vendor-panel-auth-session";

function isVendorSessionAllowed(user) {
  return Boolean(user?.id && user?.email && isAllowedAuthRole(user?.role));
}

function loadSessionFromStorage(storage) {
  if (!storage) {
    return null;
  }

  const rawSession = storage.getItem(
    storage === window.sessionStorage
      ? SESSION_AUTH_STORAGE_KEY
      : PERSISTENT_AUTH_STORAGE_KEY,
  );

  if (!rawSession) {
    return null;
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
    storage.removeItem(
      storage === window.sessionStorage
        ? SESSION_AUTH_STORAGE_KEY
        : PERSISTENT_AUTH_STORAGE_KEY,
    );
    return null;
  }

  return {
    accessToken,
    user,
  };
}

export function loadStoredAuthSession() {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      user: null,
    };
  }

  try {
    const sessionSession = loadSessionFromStorage(window.sessionStorage);

    if (sessionSession) {
      return sessionSession;
    }

    const persistentSession = loadSessionFromStorage(window.localStorage);

    if (persistentSession) {
      return persistentSession;
    }

    return {
      accessToken: null,
      user: null,
    };
  } catch {
    clearStoredAuthSession();
    return {
      accessToken: null,
      user: null,
    };
  }
}

export function persistAuthSession(session, options = {}) {
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

  const targetStorage = options.rememberMe
    ? window.localStorage
    : window.sessionStorage;
  const targetKey = options.rememberMe
    ? PERSISTENT_AUTH_STORAGE_KEY
    : SESSION_AUTH_STORAGE_KEY;
  const otherStorage = options.rememberMe
    ? window.sessionStorage
    : window.localStorage;
  const otherKey = options.rememberMe
    ? SESSION_AUTH_STORAGE_KEY
    : PERSISTENT_AUTH_STORAGE_KEY;

  otherStorage.removeItem(otherKey);
  targetStorage.setItem(targetKey, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PERSISTENT_AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_AUTH_STORAGE_KEY);
}
