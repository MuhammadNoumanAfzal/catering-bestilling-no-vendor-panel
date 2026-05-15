import { Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import NewPasswordPage from "../../features/auth/pages/NewPasswordPage";
import VerificationPage from "../../features/auth/pages/VerificationPage";
import HomePage from "../../features/home/pages/HomePage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/verification" element={<VerificationPage />} />
      <Route path="/auth/new-password" element={<NewPasswordPage />} />
    </Routes>
  );
}
