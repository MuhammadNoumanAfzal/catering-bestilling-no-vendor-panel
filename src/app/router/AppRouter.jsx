import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import NewPasswordPage from "../../features/auth/pages/NewPasswordPage";
import VerificationPage from "../../features/auth/pages/VerificationPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import AppSectionPage from "../../features/home/pages/AppSectionPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/verification" element={<VerificationPage />} />
      <Route path="/auth/new-password" element={<NewPasswordPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route path="home" element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="orders"
          element={
            <AppSectionPage
              title="Orders"
              description="This page is ready to receive order tables, filters and API-backed actions while keeping the same shared sidebar and navbar."
            />
          }
        />
        <Route
          path="menu"
          element={
            <AppSectionPage
              title="Menu"
              description="Use this section for menu categories, items and availability controls without rebuilding the app shell."
            />
          }
        />
        <Route
          path="delivery"
          element={
            <AppSectionPage
              title="Delivery"
              description="Delivery tracking, rider assignments and fulfillment timelines can be added here later with the same layout."
            />
          }
        />
        <Route
          path="finance"
          element={
            <AppSectionPage
              title="Finance"
              description="This area is ready for payouts, invoices, summaries and finance API integration."
            />
          }
        />
        <Route
          path="reviews"
          element={
            <AppSectionPage
              title="Reviews"
              description="Customer reviews, replies and rating insights can plug into this shared page shell."
            />
          }
        />
        <Route
          path="settings"
          element={
            <AppSectionPage
              title="Settings"
              description="Store profile, preferences and security settings can be added here without touching the navigation layout."
            />
          }
        />
      </Route>
    </Routes>
  );
}
