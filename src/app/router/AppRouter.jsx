import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import RouteSectionFallback from "./RouteSectionFallback";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import NewPasswordPage from "../../features/auth/pages/NewPasswordPage";
import ProtectedRoute from "../../features/auth/components/ProtectedRoute";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import VerificationPage from "../../features/auth/pages/VerificationPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import DeliveryPage from "../../features/delivery/pages/DeliveryPage";
import FinancePage from "../../features/finance/pages/FinancePage";
import NotificationsPage from "../../features/notifications/pages/NotificationsPage";
import OrderDetailPage from "../../features/order/pages/OrderDetailPage";
import OrderAdjustmentPage from "../../features/order/pages/OrderAdjustmentPage";
import OrdersPage from "../../features/order/pages/OrdersPage";
import ReviewsPage from "../../features/reviews/pages/ReviewsPage";
import SettingsPage from "../../features/settings/pages/SettingsPage";
import SupportCenterPage from "../../features/support/pages/SupportCenterPage";

const MenuPage = lazy(() => import("../../features/menu/pages/MenuPage"));
const CreateAddOnPage = lazy(() => import("../../features/menu/pages/CreateAddOnPage"));
const CreateMenuPage = lazy(() => import("../../features/menu/pages/CreateMenuPage"));

function withRouteFallback(element) {
  return (
    <Suspense fallback={<RouteSectionFallback />}>
      {element}
    </Suspense>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/verification" element={<VerificationPage />} />
      <Route path="/auth/new-password" element={<NewPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route path="home" element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="orders/:orderId/adjust" element={<OrderAdjustmentPage />} />
          <Route
            path="orders/:orderId/accepted"
            element={<Navigate to="..?stage=accepted" relative="path" replace />}
          />
          <Route path="menu" element={withRouteFallback(<MenuPage />)} />
          <Route path="menu/add-ons/create" element={withRouteFallback(<CreateAddOnPage />)} />
          <Route path="menu/create" element={withRouteFallback(<CreateMenuPage />)} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="support" element={<SupportCenterPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
