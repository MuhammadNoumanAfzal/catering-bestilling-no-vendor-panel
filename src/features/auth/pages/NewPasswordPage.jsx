import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { resetPasswordRequest } from "../api/authApi";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function NewPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formState, setFormState] = useState({
    email: searchParams.get("email") || "",
    token: searchParams.get("token") || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = useMemo(
    () => [
      { label: "8+ characters", isValid: formState.newPassword.length >= 8 },
      { label: "1 uppercase", isValid: /[A-Z]/.test(formState.newPassword) },
      { label: "1 lowercase", isValid: /[a-z]/.test(formState.newPassword) },
      { label: "1 number", isValid: /\d/.test(formState.newPassword) },
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
    if (!formState.email.trim()) {
      await showVendorErrorAlert("Please enter your email address.", "Email required");
      return;
    }

    if (!isValidEmail(formState.email)) {
      await showVendorErrorAlert("Please enter a valid email address.", "Invalid email");
      return;
    }

    if (!formState.token.trim()) {
      await showVendorErrorAlert("Please enter the verification code you received.", "Code required");
      return;
    }

    if (!isStrongPassword(formState.newPassword)) {
      await showVendorErrorAlert(
        "Use at least 8 characters with uppercase, lowercase, number, and symbol.",
        "Weak password",
      );
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      await showVendorErrorAlert("New password and confirm password must match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await resetPasswordRequest({
        email: formState.email,
        token: formState.token,
        password: formState.newPassword,
      });
      await showVendorSuccessToast(result.message);
      navigate("/auth/login", { replace: true });
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to reset the password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Set New Password"
        subtitle="Finish recovery by choosing a strong new password for your vendor account."
        fields={[
          {
            label: "Email Address",
            autoComplete: "email",
            helperText: "This should match the email used in the reset flow.",
            name: "email",
            onChange: handleFieldChange("email"),
            placeholder: "vendor@example.com",
            type: "email",
            value: formState.email,
          },
          {
            label: "Verification Code",
            autoComplete: "one-time-code",
            helperText: "Use the verified code from your email.",
            name: "token",
            onChange: handleFieldChange("token"),
            placeholder: "5391",
            value: formState.token,
          },
          {
            label: "New Password",
            autoComplete: "new-password",
            name: "newPassword",
            onChange: handleFieldChange("newPassword"),
            type: "password",
            placeholder: "Enter new password",
            value: formState.newPassword,
          },
          {
            label: "Confirm Password",
            autoComplete: "new-password",
            name: "confirmPassword",
            onChange: handleFieldChange("confirmPassword"),
            type: "password",
            placeholder: "Confirm new password",
            value: formState.confirmPassword,
          },
        ]}
        extraContent={
          <div className="rounded-[18px] border border-[#efe2d5] bg-[#fff8f2] px-4 py-3 text-left">
            <p className="type-subpara m-0 text-[#3f3229]">Almost done.</p>
            <p className="type-subpara mt-1 text-[#8a7769]">
              Your password should be unique and not reused across other services.
            </p>
          </div>
        }
        passwordRules={passwordRules}
        actionDisabled={
          isSubmitting ||
          !formState.email.trim() ||
          !formState.token.trim() ||
          !formState.newPassword.trim() ||
          !formState.confirmPassword.trim()
        }
        actionLabel={isSubmitting ? "Updating password..." : "Reset Password"}
        onAction={handleSubmit}
        backLinkLabel="Back to verification"
        backLinkTo={`/auth/verification?email=${encodeURIComponent(formState.email.trim())}`}
        formClassName="px-6 pb-6 pt-7"
        maxWidthClassName="sm:max-w-[560px]"
      />
    </AuthLayout>
  );
}
