import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";

import AuthCard from "../components/AuthCard";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import { showVendorErrorAlert, showVendorSuccessToast } from "../../../utils/vendorAlerts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthError, isAuthenticated, isLoggingIn, login } = useAuth();
  const [formState, setFormState] = useState({
    identifier: "",
    password: "",
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleFieldChange(field) {
    return (event) => {
      clearAuthError();
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleLogin() {
    if (!formState.identifier.trim()) {
      await showVendorErrorAlert("Please enter your email address.", "Email required");
      return;
    }

    if (!isValidEmail(formState.identifier.trim())) {
      await showVendorErrorAlert("Please enter a valid email address.", "Invalid email");
      return;
    }

    try {
      await login(formState);
      await showVendorSuccessToast("Logged in successfully.");
      const nextPath = location.state?.from?.pathname || "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (error) {
      await showVendorErrorAlert(error.message || "Login failed.", "Login failed");
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Login to manage your catering business"
        fields={[
          {
            autoComplete: "email",
            helperText: "Use the vendor email linked to your account.",
            label: "Email Address",
            name: "identifier",
            onChange: handleFieldChange("identifier"),
            placeholder: "vendor@example.com",
            type: "email",
            value: formState.identifier,
          },
          {
            autoComplete: "current-password",
            label: "Password",
            name: "password",
            onChange: handleFieldChange("password"),
            type: "password",
            placeholder: "Enter your password",
            value: formState.password,
          },
        ]}
        rememberMeLabel="Remember me"
        auxiliaryLinkLabel="Forgot Password?"
        auxiliaryLinkTo="/auth/forgot-password"
        actionDisabled={isLoggingIn || !formState.identifier.trim() || !formState.password.trim()}
        actionLabel={isLoggingIn ? "Signing in..." : "Login"}
        onAction={handleLogin}
        footerText="Need a vendor account?"
        footerLinkLabel="Register now"
        footerLinkTo="/auth/register"
        note="This vendor portal accepts vendor email login only."
      />
    </AuthLayout>
  );
}
