import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";

export default function VerificationPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Verify Code"
        subtitle="Enter the code sent to your email"
        otpValues={["0", "5", "7", "6"]}
        actionLabel="Verify"
        footerText="Didn't receive the code?"
        footerLinkLabel="Resend Code"
        footerLinkTo="/auth/verification"
      />
    </AuthLayout>
  );
}
