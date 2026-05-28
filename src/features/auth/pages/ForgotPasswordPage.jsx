import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { showResetLinkSentSuccess } from "../../../utils/vendorAlerts";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  async function handleSubmit() {
    if (!email.trim()) {
      return;
    }

    await showResetLinkSentSuccess();
    navigate("/auth/verification");
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
        actionLabel="Send Reset Link"
        onAction={handleSubmit}
        backLinkLabel="< Back to login"
        backLinkTo="/auth/login"
      />
    </AuthLayout>
  );
}
