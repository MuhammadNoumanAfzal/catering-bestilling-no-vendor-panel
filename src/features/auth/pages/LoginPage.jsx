import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Login to manage your catering business"
        fields={[
          {
            label: "Email or Phone",
            placeholder: "Enter your email or phone",
          },
          {
            label: "Password",
            type: "password",
            placeholder: "••••••••",
          },
        ]}
        rememberMeLabel="Remember me"
        auxiliaryLinkLabel="Forgot Password?"
        auxiliaryLinkTo="/auth/forgot-password"
        actionLabel="Login"
        footerText="Don't have an account?"
        footerLinkLabel="Contact Admin"
        footerLinkTo="/contact-admin"
      />
    </AuthLayout>
  );
}
