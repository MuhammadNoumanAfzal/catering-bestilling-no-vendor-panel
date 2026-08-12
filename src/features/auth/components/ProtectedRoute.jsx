import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const applicationStatus = `${user?.applicationStatus ?? ""}`.trim().toUpperCase();
  const vendorStatus = `${user?.vendorStatus ?? user?.status ?? ""}`.trim().toUpperCase();
  const isInvalidVendorSession =
    isAuthenticated &&
    (
      !user?.isActive ||
      user?.role !== "vendor" ||
      (applicationStatus && !["ACTIVE", "APPROVED"].includes(applicationStatus)) ||
      (vendorStatus && !["ACTIVE", "APPROVED"].includes(vendorStatus))
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

  return <Outlet />;
}
