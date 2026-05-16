import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import NewPasswordPage from "../../features/auth/pages/NewPasswordPage";
import VerificationPage from "../../features/auth/pages/VerificationPage";
import AcceptedOrderPage from "../../features/order/pages/AcceptedOrderPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import DeliveryPage from "../../features/delivery/pages/DeliveryPage";
import AppSectionPage from "../../features/home/pages/AppSectionPage";
import MenuPage from "../../features/menu/pages/MenuPage";
import OrderDetailPage from "../../features/order/pages/OrderDetailPage";
import OrdersPage from "../../features/order/pages/OrdersPage";

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
