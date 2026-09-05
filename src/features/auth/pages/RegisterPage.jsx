import { Navigate, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiEdit3 } from "react-icons/fi";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import {
  sendSignupOtpRequest,
  verifySignupOtpRequest,
} from "../api/authApi";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const SIGNUP_OTP_LENGTH = 6;

const SIGNUP_STEP = {
  FORM: "form",
  VERIFY: "verify",
};

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
  postCode: "",
  password: "",
  confirmPassword: "",
};

function getReadableErrorMessage(error) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error && error.message) {
    return error.message;
  }

  return "Registration failed.";
}

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

function normalizePhoneNumber(phone) {
  return phone.replace(/\s+/g, "").trim();
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

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [signupStep, setSignupStep] = useState(SIGNUP_STEP.FORM);
  const [formState, setFormState] = useState(initialFormState);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const passwordStrength = useMemo(
    () => getPasswordStrength(formState.password),
    [formState.password],
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleFieldChange(field) {
    return (event) => {
      const nextValue = event.target.value;
      setFormState((current) => ({
        ...current,
        [field]: nextValue,
      }));
      setFormErrors((current) => ({
        ...current,
        [field]: "",
      }));

      if (field === "email" && signupStep === SIGNUP_STEP.VERIFY) {
        setSignupStep(SIGNUP_STEP.FORM);
        setOtpCode("");
        setOtpError("");
      }

      if (field === "phone" && signupStep === SIGNUP_STEP.VERIFY) {
        setSignupStep(SIGNUP_STEP.FORM);
        setOtpCode("");
        setOtpError("");
      }
    };
  }

  async function handleSendOtp() {
    setFormErrors({});

    if (
      !formState.firstName.trim() ||
      !formState.lastName.trim() ||
      !formState.email.trim() ||
      !formState.phone.trim() ||
      !formState.companyName.trim() ||
      !formState.postCode.trim() ||
      !formState.password.trim() ||
      !formState.confirmPassword.trim()
    ) {
      await showVendorErrorAlert(t("auth.validation.allRequired"), t("auth.validation.incomplete"));
      return;
    }

    if (!isValidEmail(formState.email)) {
      await showVendorErrorAlert(t("auth.validation.invalidEmail"), t("auth.validation.invalidEmailTitle"));
      return;
    }

    if (!/^\d+$/.test(formState.postCode.trim())) {
      await showVendorErrorAlert(t("auth.validation.invalidPostCode"), t("auth.validation.invalidPostCodeTitle"));
      return;
    }

    const normalizedPhone = normalizePhoneNumber(formState.phone);

    if (!/^\+?\d+$/.test(normalizedPhone)) {
      await showVendorErrorAlert(
        "Phone number can only include digits and an optional leading +.",
        "Invalid phone number",
      );
      return;
    }

    if (normalizedPhone.length > 15) {
      await showVendorErrorAlert(
        "Phone number must be 15 characters or fewer.",
        "Invalid phone number",
      );
      return;
    }

    if (!isStrongPassword(formState.password)) {
      await showVendorErrorAlert(
        "Use at least 8 characters with uppercase, lowercase, number, and symbol.",
        "Weak password",
      );
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      await showVendorErrorAlert(t("auth.validation.passwordsMismatch"), t("auth.validation.mismatchTitle"));
      return;
    }

    setIsSendingOtp(true);

    try {
      const result = await sendSignupOtpRequest({
        ...formState,
        phone: normalizedPhone,
      });
      setOtpCode("");
      setOtpError("");
      setSignupStep(SIGNUP_STEP.VERIFY);
      await showVendorSuccessToast(result.message || "Verification code sent to your email.");
    } catch (error) {
      const phoneError = error?.fieldErrors?.phone?.[0] || "";
      const emailError = error?.fieldErrors?.email?.[0] || "";

      if (phoneError || emailError) {
        setFormErrors({
          ...(phoneError ? { phone: phoneError } : {}),
          ...(emailError ? { email: emailError } : {}),
        });
      }

      await showVendorErrorAlert(getReadableErrorMessage(error), "Unable to send code");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!new RegExp(`^\\d{${SIGNUP_OTP_LENGTH}}$`).test(otpCode)) {
      setOtpError(t("auth.validation.codeLength", { count: SIGNUP_OTP_LENGTH }));
      return;
    }

    setOtpError("");
    setIsVerifyingOtp(true);

    try {
      const result = await verifySignupOtpRequest({
        ...formState,
        email: formState.email,
        otp: otpCode,
      });
      await showVendorSuccessToast(result?.message || "Account created successfully.");
      setFormState(initialFormState);
      setOtpCode("");
      setSignupStep(SIGNUP_STEP.FORM);
      navigate("/auth/login", { replace: true });
    } catch (error) {
      const fieldOtpError = error?.fieldErrors?.otp?.[0] || "";

      if (fieldOtpError) {
        setOtpError(fieldOtpError);
      } else {
        await showVendorErrorAlert(
          getReadableErrorMessage(error),
          "Unable to verify code",
        );
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        actionDisabled={isSendingOtp || isVerifyingOtp}
        actionLabel={
          signupStep === SIGNUP_STEP.VERIFY
            ? isVerifyingOtp
              ? "Verifying..."
              : "Verify & Create Account"
            : isSendingOtp
              ? "Sending code..."
              : "Register"
        }
        auxiliaryLinkLabel="Already have an account?"
        auxiliaryLinkTo="/auth/login"
        fieldsColumnsClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
        fields={
          signupStep === SIGNUP_STEP.FORM
            ? [
                {
            label: t("auth.register.firstName"),
                  name: "firstName",
                  onChange: handleFieldChange("firstName"),
                  placeholder: "Sarah",
                  value: formState.firstName,
                },
                {
            label: t("auth.register.lastName"),
                  name: "lastName",
                  onChange: handleFieldChange("lastName"),
                  placeholder: "Jensen",
                  value: formState.lastName,
                },
                {
                  label: t("auth.emailAddress"),
                  autoComplete: "email",
                  name: "email",
                  onChange: handleFieldChange("email"),
                  placeholder: "corporate.eats@example.com",
                  type: "email",
                  value: formState.email,
                  errorText: formErrors.email,
                  helperText: "We will send a verification code after you click Register.",
                },
                {
                  errorText: formErrors.phone,
                  label: t("auth.register.phone"),
                  maxLength: 15,
                  name: "phone",
                  onChange: handleFieldChange("phone"),
                  placeholder: "+4798765432",
                  type: "tel",
                  autoComplete: "tel",
                  value: formState.phone,
                },
                {
                  label: t("auth.register.company"),
                  name: "companyName",
                  onChange: handleFieldChange("companyName"),
                  placeholder: "Nordic Gourmet Catering",
                  value: formState.companyName,
                },
                {
                  label: t("auth.register.postCode"),
                  name: "postCode",
                  onChange: handleFieldChange("postCode"),
                  placeholder: "9021",
                  value: formState.postCode,
                },
                {
                  label: t("auth.password"),
                  autoComplete: "new-password",
                  name: "password",
                  onChange: handleFieldChange("password"),
                  placeholder: "Create a strong password",
                  strengthIndicator: passwordStrength,
                  type: "password",
                  value: formState.password,
                },
                {
                  label: t("auth.confirmPassword"),
                  autoComplete: "new-password",
                  name: "confirmPassword",
                  onChange: handleFieldChange("confirmPassword"),
                  placeholder: "Confirm your password",
                  type: "password",
                  value: formState.confirmPassword,
                },
              ]
            : [
                {
                  label: t("auth.register.codeLabel"),
                  inputMode: "numeric",
                  maxLength: SIGNUP_OTP_LENGTH,
                  name: "otp",
                  onChange: (event) => {
                    setOtpError("");
                    setOtpCode(
                      event.target.value.replace(/\D/g, "").slice(0, SIGNUP_OTP_LENGTH),
                    );
                  },
                  placeholder: "Enter 6-digit code",
                  type: "text",
                  value: otpCode,
                  helperText: `We sent a verification code to ${formState.email}. It expires in 10 minutes.`,
                  errorText: otpError,
                  containerClassName: "sm:col-span-2",
                },
              ]
        }
        extraContent={
          signupStep === SIGNUP_STEP.VERIFY ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setSignupStep(SIGNUP_STEP.FORM);
                  setOtpCode("");
                  setOtpError("");
                }}
                disabled={isSendingOtp || isVerifyingOtp}
                className="type-para inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-[#d9cdc3] bg-white font-bold text-[#7b6f66] transition duration-150 hover:border-[#cf6e38] hover:text-[#cf6e38] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <FiEdit3 className="text-[14px]" />
                {t("auth.register.edit")}
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || isVerifyingOtp}
                className="type-para inline-flex min-h-[42px] w-full items-center justify-center rounded-lg border border-[#cf6e38] bg-white font-bold text-[#cf6e38] transition duration-150 hover:bg-[#fff4ee] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSendingOtp ? t("auth.register.sending") : t("auth.register.resend")}
              </button>
            </div>
          ) : null
        }
        footerLinkLabel={t("auth.register.signIn")}
        footerLinkTo="/auth/login"
        footerText={t("auth.register.alreadyAccount")}
        formClassName="px-6 pb-6 pt-7"
        maxWidthClassName="sm:max-w-[760px]"
        onAction={signupStep === SIGNUP_STEP.VERIFY ? handleVerifyOtp : handleSendOtp}
        subtitle={
          signupStep === SIGNUP_STEP.VERIFY
            ? t("auth.register.verifySubtitle", { email: formState.email })
            : t("auth.register.subtitle")
        }
        title={
          signupStep === SIGNUP_STEP.VERIFY
            ? t("auth.register.verifyTitle")
            : t("auth.register.title")
        }
      />
    </AuthLayout>
  );
}
