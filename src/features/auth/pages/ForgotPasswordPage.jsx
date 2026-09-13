import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { requestPasswordResetMail } from "../api/authApi";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
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
      setIsSubmitting(true);
      const result = await requestPasswordResetMail({ email: trimmedEmail });
      await showVendorSuccessToast(result.message);
      navigate(`/auth/verification?email=${encodeURIComponent(trimmedEmail)}`, {
        replace: true,
      });
    } catch (error) {
      await showVendorErrorAlert(error.message || t("auth.validation.requestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        actionDisabled={isSubmitting || !email.trim()}
        actionLabel={isSubmitting ? t("auth.forgot.sending") : t("auth.forgot.submit")}
        actionNote="We’ll send a 4-digit verification code to this email."
        extraContent={
          <div className="rounded-[18px] border border-[#efe2d5] bg-[#fff8f2] px-4 py-3 text-left">
            <p className="type-subpara m-0 text-[#3f3229]">{t("auth.forgot.secure")}</p>
            <p className="type-subpara mt-1 text-[#8a7769]">
              {t("auth.forgot.secureDescription")}
            </p>
          </div>
        }
        title={t("auth.forgot.title")}
        subtitle={t("auth.forgot.subtitle")}
        fields={[
          {
            label: t("auth.emailAddress"),
            autoComplete: "email",
            helperText: "We’ll use this to send your reset code.",
            name: "email",
            onChange: (event) => setEmail(event.target.value),
            placeholder: "vendor@example.com",
            type: "email",
            value: email,
          },
        ]}
        onAction={handleSubmit}
        backLinkLabel={t("auth.forgot.back")}
        backLinkTo="/auth/login"
        formClassName="px-6 pb-6 pt-7"
        maxWidthClassName="sm:max-w-[520px]"
      />
    </AuthLayout>
  );
}
