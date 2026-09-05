import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import AuthCard from "../components/AuthCard";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import { getVendorPostLoginPath } from "../api/authApi";
import { showVendorErrorAlert, showVendorSuccessToast } from "../../../utils/vendorAlerts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthError, isAuthenticated, isLoggingIn, login, user } = useAuth();
  const [formState, setFormState] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  if (isAuthenticated) {
    return <Navigate to={getVendorPostLoginPath(user)} replace />;
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

  function handleRememberMeChange(event) {
    clearAuthError();
    setFormState((current) => ({
      ...current,
      rememberMe: Boolean(event.target.checked),
    }));
  }

  async function handleLogin() {
    if (!formState.identifier.trim()) {
      await showVendorErrorAlert(t("auth.validation.emailRequired"), t("auth.validation.emailRequiredTitle"));
      return;
    }

    if (!isValidEmail(formState.identifier.trim())) {
      await showVendorErrorAlert(t("auth.validation.invalidEmail"), t("auth.validation.invalidEmailTitle"));
      return;
    }

    try {
      const session = await login(formState);
      await showVendorSuccessToast(t("auth.login.success"));
      const nextPath = location.state?.from?.pathname || getVendorPostLoginPath(session?.user);
      navigate(nextPath, { replace: true });
    } catch (error) {
      await showVendorErrorAlert(error.message || t("auth.login.failed"), t("auth.login.failed"));
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.login.title")}
        subtitle={t("auth.login.subtitle")}
        fields={[
          {
            autoComplete: "email",
            helperText: t("auth.login.emailHelp"), label: t("auth.emailAddress"),
            name: "identifier",
            onChange: handleFieldChange("identifier"),
            placeholder: "vendor@example.com",
            type: "email",
            value: formState.identifier,
          },
          {
            autoComplete: "current-password",
            label: t("auth.password"),
            name: "password",
            onChange: handleFieldChange("password"),
            type: "password",
            placeholder: t("auth.login.passwordPlaceholder"),
            value: formState.password,
          },
        ]}
        rememberMeLabel={t("auth.login.rememberMe")}
        rememberMeChecked={formState.rememberMe}
        onRememberMeChange={handleRememberMeChange}
        auxiliaryLinkLabel={t("auth.login.forgotPassword")}
        auxiliaryLinkTo="/auth/forgot-password"
        actionDisabled={isLoggingIn || !formState.identifier.trim() || !formState.password.trim()}
        actionLabel={isLoggingIn ? t("auth.login.signingIn") : t("auth.login.submit")}
        onAction={handleLogin}
        footerText={t("auth.login.noAccount")}
        footerLinkLabel={t("auth.login.register")}
        footerLinkTo="/auth/register"
        note={t("auth.login.note")}
      />
    </AuthLayout>
  );
}
