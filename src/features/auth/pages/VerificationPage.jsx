import { useState } from "react";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { showVendorErrorAlert } from "../../../utils/vendorAlerts";

export default function VerificationPage() {
  const [verificationCode, setVerificationCode] = useState("");

  async function handleVerify() {
    if (!verificationCode.trim()) {
      return;
    }

    await showVendorErrorAlert(
      "Verification is not connected yet. Add your backend OTP verification mutation here.",
      "Verification not configured",
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        fields={[
          {
            label: "Verification Code",
            name: "verificationCode",
            onChange: (event) => setVerificationCode(event.target.value),
            placeholder: "Enter the code you received",
            value: verificationCode,
          },
        ]}
        title="Verify Code"
        subtitle="Enter the code sent to your email"
        actionDisabled={!verificationCode.trim()}
        actionLabel="Verify"
        onAction={handleVerify}
        footerText="Didn't receive the code?"
        footerLinkLabel="Resend Code"
        footerLinkTo="/auth/forgot-password"
      />
    </AuthLayout>
  );
}
