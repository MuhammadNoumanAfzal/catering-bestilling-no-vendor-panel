import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Forgot Password"
        subtitle="Enter your email to receive a reset link"
        fields={[
          {
            label: "Email Address",
            placeholder: "hello@example.com",
          },
        ]}
        actionLabel="Send Reset Link"
        backLinkLabel="← Back to login"
        backLinkTo="/auth/login"
      />
    </AuthLayout>
  );
}
