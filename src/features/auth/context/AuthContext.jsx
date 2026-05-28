import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_STORAGE_KEY = "vendor-panel-auth";

const AuthContext = createContext(null);

function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function login(credentials) {
    const normalizedIdentifier = credentials.identifier.trim().toLowerCase();
    const normalizedPassword = credentials.password.trim();

    const validIdentifiers = ["admin@vendorpanel.com", "+4791295832", "admin"];
    const validPassword = "admin123";

    if (!validIdentifiers.includes(normalizedIdentifier) || normalizedPassword !== validPassword) {
      return {
        ok: false,
        message: "Use demo login: admin@vendorpanel.com / admin123",
      };
    }

    const nextUser = {
      name: "Raj Holder",
      role: "Admin",
      email: "admin@vendorpanel.com",
    };

    setUser(nextUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));

    return { ok: true };
  }

  function logout() {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      login,
      logout,
      user,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
