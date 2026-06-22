import { useState } from "react";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { showVendorErrorAlert } from "../../../utils/vendorAlerts";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  async function handleSubmit() {
    if (!email.trim()) {
      return;
    }

    await showVendorErrorAlert(
      "Password recovery is not connected yet. Wire this page to your reset-password mutation.",
      "Reset flow not configured",
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot Password"
        subtitle="Enter your email to receive a reset link"
        fields={[
          {
            label: "Email Address",
            name: "email",
            onChange: (event) => setEmail(event.target.value),
            placeholder: "hello@example.com",
            value: email,
          },
        ]}
        actionDisabled={!email.trim()}
        actionLabel="Request Reset"
        onAction={handleSubmit}
        backLinkLabel="< Back to login"
        backLinkTo="/auth/login"
        note="Connect this screen to your backend reset-password flow when the API is ready."
      />
    </AuthLayout>
  );
}
