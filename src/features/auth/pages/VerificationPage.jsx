import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import {
  requestPasswordResetMail,
  verifyPasswordResetCode,
} from "../api/authApi";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function VerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleVerify() {
    const trimmedEmail = email.trim();
    const trimmedCode = verificationCode.trim();

    if (!trimmedEmail) {
      await showVendorErrorAlert("Please enter your email address.", "Email required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      await showVendorErrorAlert("Please enter a valid email address.", "Invalid email");
      return;
    }

    if (!trimmedCode) {
      await showVendorErrorAlert("Please enter the verification code.", "Code required");
      return;
    }

    try {
      setIsVerifying(true);
      const result = await verifyPasswordResetCode({
        email: trimmedEmail,
        pin: trimmedCode,
      });
      await showVendorSuccessToast(result.message);
      navigate(
        `/auth/new-password?email=${encodeURIComponent(trimmedEmail)}&token=${encodeURIComponent(trimmedCode)}`,
        { replace: true },
      );
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to verify the reset code.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      await showVendorErrorAlert("Add your email first so we know where to resend the code.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      await showVendorErrorAlert("Please enter a valid email address.", "Invalid email");
      return;
    }

    try {
      setIsResending(true);
      const result = await requestPasswordResetMail({ email: trimmedEmail });
      await showVendorSuccessToast(result.message);
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to resend the reset code.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        actionDisabled={isVerifying || !email.trim() || !verificationCode.trim()}
        actionLabel={isVerifying ? "Verifying..." : "Verify Code"}
        extraContent={
          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#efe2d5] bg-[#fff8f2] px-4 py-3 max-[520px]:flex-col max-[520px]:items-stretch">
            <div>
              <p className="type-subpara m-0 text-[#3f3229]">Didn&apos;t receive the code?</p>
              <p className="type-subpara mt-1 text-[#8a7769]">
                Check spam first, then request a fresh code.
              </p>
            </div>
            <button
              className="type-subpara min-h-[40px] rounded-full border border-[#e3c9b7] bg-white px-4 text-[#9d562e] transition hover:bg-[#fff2e8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isResending}
              onClick={handleResendCode}
              type="button"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </div>
        }
        fields={[
          {
            label: "Email Address",
            autoComplete: "email",
            helperText: "Use the same email where you requested the reset code.",
            name: "email",
            onChange: (event) => setEmail(event.target.value),
            placeholder: "vendor@example.com",
            type: "email",
            value: email,
          },
          {
            label: "Verification Code",
            autoComplete: "one-time-code",
            helperText: "Enter the 4-digit code from your email.",
            name: "verificationCode",
            onChange: (event) => setVerificationCode(event.target.value),
            placeholder: "5391",
            type: "text",
            value: verificationCode,
          },
        ]}
        title="Verify Code"
        subtitle="Confirm the code we sent before creating your new password."
        onAction={handleVerify}
        backLinkLabel="Change email"
        backLinkTo={`/auth/forgot-password?email=${encodeURIComponent(email.trim())}`}
        formClassName="px-6 pb-6 pt-7"
        maxWidthClassName="sm:max-w-[560px]"
      />
    </AuthLayout>
  );
}
