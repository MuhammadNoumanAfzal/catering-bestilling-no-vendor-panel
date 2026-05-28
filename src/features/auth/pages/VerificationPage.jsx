import { useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { showVerificationSuccess } from "../../../utils/vendorAlerts";

export default function VerificationPage() {
  const navigate = useNavigate();

  async function handleVerify() {
    await showVerificationSuccess();
    navigate("/auth/new-password");
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Verify Code"
        subtitle="Enter the code sent to your email"
        otpValues={["0", "5", "7", "6"]}
        actionLabel="Verify"
        onAction={handleVerify}
        footerText="Didn't receive the code?"
        footerLinkLabel="Resend Code"
        footerLinkTo="/auth/verification"
      />
    </AuthLayout>
  );
}
