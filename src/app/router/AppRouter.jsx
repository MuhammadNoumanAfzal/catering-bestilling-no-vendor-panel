import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import NewPasswordPage from "../../features/auth/pages/NewPasswordPage";
import VerificationPage from "../../features/auth/pages/VerificationPage";
import AcceptedOrderPage from "../../features/order/pages/AcceptedOrderPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import DeliveryPage from "../../features/delivery/pages/DeliveryPage";
import FinancePage from "../../features/finance/pages/FinancePage";
import MenuPage from "../../features/menu/pages/MenuPage";
import NotificationsPage from "../../features/notifications/pages/NotificationsPage";
import OrderDetailPage from "../../features/order/pages/OrderDetailPage";
import OrdersPage from "../../features/order/pages/OrdersPage";
import ReviewsPage from "../../features/reviews/pages/ReviewsPage";
import SettingsPage from "../../features/settings/pages/SettingsPage";
import SupportCenterPage from "../../features/support/pages/SupportCenterPage";

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
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="orders/:orderId/accepted" element={<AcceptedOrderPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="delivery" element={<DeliveryPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="support" element={<SupportCenterPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
