import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";

const passwordRules = [
  { label: "8+ characters", isValid: true },
  { label: "1 uppercase", isValid: true },
  { label: "1 symbol", isValid: false },
];

export default function NewPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Set New Password"
        subtitle="Create a strong password for your account"
        fields={[
          {
            label: "New Password",
            type: "password",
            placeholder: "Enter new password",
          },
          {
            label: "Confirm Password",
            type: "password",
            placeholder: "Confirm new password",
          },
        ]}
        passwordRules={passwordRules}
        actionLabel="Reset Password"
        backLinkLabel="Back to login"
        backLinkTo="/auth/login"
      />
    </AuthLayout>
  );
}
