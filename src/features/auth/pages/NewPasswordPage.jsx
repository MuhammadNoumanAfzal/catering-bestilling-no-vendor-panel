import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { resetPasswordRequest } from "../api/authApi";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function getPasswordStrength(password) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (!password) {
    return {
      barClassName: "bg-[#eadfd6]",
      filledBars: 0,
      isVisible: false,
      label: "Weak",
      toneClassName: "text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a7769]",
    };
  }

  if (score <= 2) {
    return {
      barClassName: "bg-[#d76a4a]",
      filledBars: 1,
      isVisible: true,
      label: "Weak",
      toneClassName: "text-[11px] font-bold uppercase tracking-[0.08em] text-[#d76a4a]",
    };
  }

  if (score <= 4) {
    return {
      barClassName: "bg-[#d6a23d]",
      filledBars: 2,
      isVisible: true,
      label: "Medium",
      toneClassName: "text-[11px] font-bold uppercase tracking-[0.08em] text-[#b8841f]",
    };
  }

  return {
    barClassName: "bg-[#4d9b5f]",
    filledBars: 3,
    isVisible: true,
    label: "Strong",
    toneClassName: "text-[11px] font-bold uppercase tracking-[0.08em] text-[#3f7f4e]",
  };
}

export default function NewPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formState, setFormState] = useState({
    email: searchParams.get("email") || "",
    token: searchParams.get("token") || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = useMemo(
    () => [
      { label: t("auth.rules.characters"), isValid: formState.newPassword.length >= 8 },
      { label: t("auth.rules.uppercase"), isValid: /[A-Z]/.test(formState.newPassword) },
      { label: t("auth.rules.lowercase"), isValid: /[a-z]/.test(formState.newPassword) },
      { label: t("auth.rules.number"), isValid: /\d/.test(formState.newPassword) },
      { label: t("auth.rules.symbol"), isValid: /[^A-Za-z0-9]/.test(formState.newPassword) },
    ],
    [formState.newPassword],
  );
  const passwordStrength = useMemo(
    () => getPasswordStrength(formState.newPassword),
    [formState.newPassword],
  );

  function handleFieldChange(field) {
    return (event) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleSubmit() {
    if (!formState.email.trim()) {
      await showVendorErrorAlert(t("auth.validation.emailRequired"), t("auth.validation.emailRequiredTitle"));
      return;
    }

    if (!isValidEmail(formState.email)) {
      await showVendorErrorAlert(t("auth.validation.invalidEmail"), t("auth.validation.invalidEmailTitle"));
      return;
    }

    if (!formState.token.trim()) {
      await showVendorErrorAlert(t("auth.validation.codeRequired"), t("auth.validation.codeRequiredTitle"));
      return;
    }

    if (!isStrongPassword(formState.newPassword)) {
      await showVendorErrorAlert(
        t("auth.validation.weakPassword"),
        t("auth.validation.weakPasswordTitle"),
      );
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      await showVendorErrorAlert(t("auth.validation.passwordsMismatch"), t("auth.validation.mismatchTitle"));
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await resetPasswordRequest({
        email: formState.email,
        token: formState.token,
        password: formState.newPassword,
      });
      await showVendorSuccessToast(result.message);
      navigate("/auth/login", { replace: true });
    } catch (error) {
      await showVendorErrorAlert(error.message || t("auth.validation.resetFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.reset.title")}
        subtitle={t("auth.reset.subtitle")}
        fields={[
          {
            label: t("auth.emailAddress"),
            autoComplete: "email",
            helperText: t("auth.reset.emailHelp"),
            name: "email",
            onChange: handleFieldChange("email"),
            placeholder: "vendor@example.com",
            type: "email",
            value: formState.email,
          },
          {
            label: t("auth.verificationCode"),
            autoComplete: "one-time-code",
            helperText: t("auth.reset.codeHelp"),
            name: "token",
            onChange: handleFieldChange("token"),
            placeholder: "5391",
            value: formState.token,
          },
          {
            label: t("auth.newPassword"),
            autoComplete: "new-password",
            name: "newPassword",
            onChange: handleFieldChange("newPassword"),
            strengthIndicator: passwordStrength,
            type: "password",
            placeholder: t("auth.reset.newPlaceholder"),
            value: formState.newPassword,
          },
          {
            label: t("auth.confirmPassword"),
            autoComplete: "new-password",
            name: "confirmPassword",
            onChange: handleFieldChange("confirmPassword"),
            type: "password",
            placeholder: t("auth.reset.confirmPlaceholder"),
            value: formState.confirmPassword,
          },
        ]}
        extraContent={
          <div className="rounded-[18px] border border-[#efe2d5] bg-[#fff8f2] px-4 py-3 text-left">
            <p className="type-subpara m-0 text-[#3f3229]">{t("auth.reset.almostDone")}</p>
            <p className="type-subpara mt-1 text-[#8a7769]">
              {t("auth.reset.uniquePassword")}
            </p>
          </div>
        }
        passwordRules={passwordRules}
        actionDisabled={
          isSubmitting ||
          !formState.email.trim() ||
          !formState.token.trim() ||
          !formState.newPassword.trim() ||
          !formState.confirmPassword.trim()
        }
        actionLabel={isSubmitting ? t("auth.reset.updating") : t("auth.reset.submit")}
        onAction={handleSubmit}
        backLinkLabel={t("auth.reset.back")}
        backLinkTo={`/auth/verification?email=${encodeURIComponent(formState.email.trim())}`}
        formClassName="px-6 pb-6 pt-7"
        maxWidthClassName="sm:max-w-[560px]"
      />
    </AuthLayout>
  );
}
