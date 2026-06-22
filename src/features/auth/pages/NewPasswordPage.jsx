import { useMemo, useState } from "react";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import {
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";

export default function NewPasswordPage() {
  const [formState, setFormState] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const passwordRules = useMemo(
    () => [
      { label: "8+ characters", isValid: formState.newPassword.length >= 8 },
      { label: "1 uppercase", isValid: /[A-Z]/.test(formState.newPassword) },
      { label: "1 symbol", isValid: /[^A-Za-z0-9]/.test(formState.newPassword) },
    ],
    [formState.newPassword],
  );

  function handleFieldChange(field) {
    return (event) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleSubmit() {
    if (formState.newPassword.length < 8) {
      await showVendorErrorAlert("Your new password must be at least 8 characters long.");
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      await showVendorErrorAlert("New password and confirm password must match.");
      return;
    }

    await showVendorErrorAlert(
      "Password reset is not connected yet. Hook this page to your reset mutation.",
      "Reset not configured",
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Set New Password"
        subtitle="Create a strong password for your account"
        fields={[
          {
            label: "New Password",
            name: "newPassword",
            onChange: handleFieldChange("newPassword"),
            type: "password",
            placeholder: "Enter new password",
            value: formState.newPassword,
          },
          {
            label: "Confirm Password",
            name: "confirmPassword",
            onChange: handleFieldChange("confirmPassword"),
            type: "password",
            placeholder: "Confirm new password",
            value: formState.confirmPassword,
          },
        ]}
        passwordRules={passwordRules}
        actionDisabled={!formState.newPassword.trim() || !formState.confirmPassword.trim()}
        actionLabel="Reset Password"
        onAction={handleSubmit}
        backLinkLabel="Back to login"
        backLinkTo="/auth/login"
        note="This page is ready for wiring once your reset-password API is available."
      />
    </AuthLayout>
  );
}
