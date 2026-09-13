import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      await showVendorErrorAlert(t("auth.validation.emailRequired"), t("auth.validation.emailRequiredTitle"));
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      await showVendorErrorAlert(t("auth.validation.invalidEmail"), t("auth.validation.invalidEmailTitle"));
      return;
    }

    if (!trimmedCode) {
      await showVendorErrorAlert(t("auth.validation.codeRequired"), t("auth.validation.codeRequiredTitle"));
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
      await showVendorErrorAlert(error.message || t("auth.validation.unableToVerify"));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      await showVendorErrorAlert(t("auth.validation.emailRequired"), t("auth.validation.emailRequiredTitle"));
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      await showVendorErrorAlert(t("auth.validation.invalidEmail"), t("auth.validation.invalidEmailTitle"));
      return;
    }

    try {
      setIsResending(true);
      const result = await requestPasswordResetMail({ email: trimmedEmail });
      await showVendorSuccessToast(result.message);
    } catch (error) {
      await showVendorErrorAlert(error.message || t("auth.validation.unableToSend"));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        actionDisabled={isVerifying || !email.trim() || !verificationCode.trim()}
        actionLabel={isVerifying ? t("auth.verify.verifying") : t("auth.verify.submit")}
        extraContent={
          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#efe2d5] bg-[#fff8f2] px-4 py-3 max-[520px]:flex-col max-[520px]:items-stretch">
            <div>
              <p className="type-subpara m-0 text-[#3f3229]">{t("auth.verify.noCode")}</p>
              <p className="type-subpara mt-1 text-[#8a7769]">
                {t("auth.verify.noCodeHelp")}
              </p>
            </div>
            <button
              className="type-subpara min-h-[40px] rounded-full border border-[#e3c9b7] bg-white px-4 text-[#9d562e] transition hover:bg-[#fff2e8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isResending}
              onClick={handleResendCode}
              type="button"
            >
              {isResending ? t("auth.verify.resending") : t("auth.verify.resend")}
            </button>
          </div>
        }
        fields={[
          {
            label: t("auth.emailAddress"),
            autoComplete: "email",
            helperText: t("auth.verify.emailHelp"),
            name: "email",
            onChange: (event) => setEmail(event.target.value),
            placeholder: "vendor@example.com",
            type: "email",
            value: email,
          },
          {
            label: t("auth.verificationCode"),
            autoComplete: "one-time-code",
            helperText: t("auth.verify.helper"),
            name: "verificationCode",
            onChange: (event) => setVerificationCode(event.target.value),
            placeholder: "5391",
            type: "text",
            value: verificationCode,
          },
        ]}
        title={t("auth.verify.title")}
        subtitle={t("auth.verify.subtitle")}
        onAction={handleVerify}
        backLinkLabel={t("auth.verify.changeEmail")}
        backLinkTo={`/auth/forgot-password?email=${encodeURIComponent(email.trim())}`}
        formClassName="px-6 pb-6 pt-7"
        maxWidthClassName="sm:max-w-[560px]"
      />
    </AuthLayout>
  );
}
