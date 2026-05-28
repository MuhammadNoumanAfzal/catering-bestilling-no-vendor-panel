import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { showVendorErrorAlert, showVendorSuccessToast } from "../../../utils/vendorAlerts";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formState, setFormState] = useState({
    identifier: "",
    password: "",
  });
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleFieldChange(field) {
    return (event) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleLogin() {
    const result = login(formState);

    if (!result.ok) {
      await showVendorErrorAlert(result.message, "Login failed");
      return;
    }

    await showVendorSuccessToast("Logged in successfully.");
    const nextPath = location.state?.from?.pathname || "/dashboard";
    navigate(nextPath, { replace: true });
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Login to manage your catering business"
        fields={[
          {
            label: "Email or Phone",
            name: "identifier",
            onChange: handleFieldChange("identifier"),
            placeholder: "Enter your email or phone",
            value: formState.identifier,
          },
          {
            label: "Password",
            name: "password",
            onChange: handleFieldChange("password"),
            type: "password",
            placeholder: "........",
            value: formState.password,
          },
        ]}
        rememberMeLabel="Remember me"
        auxiliaryLinkLabel="Forgot Password?"
        auxiliaryLinkTo="/auth/forgot-password"
        actionDisabled={!formState.identifier.trim() || !formState.password.trim()}
        actionLabel="Login"
        onAction={handleLogin}
        footerText="Don't have an account?"
        footerLinkLabel="Contact Admin"
        footerLinkTo="/contact-admin"
        note="Demo login: admin@vendorpanel.com / admin123"
      />
    </AuthLayout>
  );
}
