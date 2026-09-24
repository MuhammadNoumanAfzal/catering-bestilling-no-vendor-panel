import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const normalizedRole = `${user?.role ?? ""}`.trim().toLowerCase();
  const isIdentityVerificationRoute = location.pathname === "/identity-verification";
  const needsIdentityVerification = isAuthenticated && !user?.identityVerified;
  const isInvalidVendorSession =
    isAuthenticated &&
    (
      !user?.id ||
      !user?.email ||
      normalizedRole !== "vendor"
    );

  useEffect(() => {
    if (isInvalidVendorSession) {
      logout().catch(() => {});
    }
  }, [isInvalidVendorSession, logout]);

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/auth/login" />;
  }

  if (isInvalidVendorSession) {
    return <Navigate replace to="/auth/login" />;
  }

  if (needsIdentityVerification && !isIdentityVerificationRoute) {
    return <Navigate replace state={{ from: location }} to={{ pathname: "/identity-verification", search: location.search }} />;
  }

  return <Outlet />;
}
