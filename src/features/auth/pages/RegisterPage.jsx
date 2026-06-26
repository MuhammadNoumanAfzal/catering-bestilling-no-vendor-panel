import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

import AuthCard from "../components/AuthCard";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { clearRegisterError, isAuthenticated, isRegistering, register } = useAuth();
  const [formState, setFormState] = useState(initialFormState);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleFieldChange(field) {
    return (event) => {
      clearRegisterError();
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleSubmit() {
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
      await showVendorErrorAlert("Please complete all required fields.", "Registration incomplete");
      return;
    }

    if (!isValidEmail(formState.email)) {
      await showVendorErrorAlert("Please enter a valid email address.", "Invalid email");
      return;
    }

    if (!/^\d+$/.test(formState.postCode.trim())) {
      await showVendorErrorAlert("Post code must contain digits only.", "Invalid post code");
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
      await showVendorErrorAlert("Password and confirm password must match.", "Password mismatch");
      return;
    }

    let result;

    try {
      result = await register({
        companyName: formState.companyName,
        email: formState.email,
        firstName: formState.firstName,
        lastName: formState.lastName,
        password: formState.password,
        phone: normalizedPhone,
        postCode: formState.postCode,
      });
    } catch (error) {
      await showVendorErrorAlert(
        getReadableErrorMessage(error),
        "Unable to register",
      );
      return;
    }

    await showVendorSuccessToast(result?.message || "Account created successfully.");
    navigate("/auth/login", { replace: true });
  }

  return (
    <AuthLayout>
      <AuthCard
        actionDisabled={isRegistering}
        actionLabel={isRegistering ? "Creating account..." : "Create Vendor Account"}
        auxiliaryLinkLabel="Already have an account?"
        auxiliaryLinkTo="/auth/login"
        fieldsColumnsClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
        fields={[
          {
            label: "First Name",
            name: "firstName",
            onChange: handleFieldChange("firstName"),
            placeholder: "Sarah",
            value: formState.firstName,
          },
          {
            label: "Last Name",
            name: "lastName",
            onChange: handleFieldChange("lastName"),
            placeholder: "Jensen",
            value: formState.lastName,
          },
          {
            label: "Email Address",
            name: "email",
            onChange: handleFieldChange("email"),
            placeholder: "corporate.eats@example.com",
            type: "email",
            value: formState.email,
          },
          {
            label: "Phone Number",
            maxLength: 15,
            name: "phone",
            onChange: handleFieldChange("phone"),
            placeholder: "+4798765432",
            type: "tel",
            autoComplete: "tel",
            value: formState.phone,
          },
          {
            label: "Company Name",
            name: "companyName",
            onChange: handleFieldChange("companyName"),
            placeholder: "Nordic Gourmet Catering",
            value: formState.companyName,
          },
          {
            label: "Post Code",
            name: "postCode",
            onChange: handleFieldChange("postCode"),
            placeholder: "9021",
            value: formState.postCode,
          },
          {
            label: "Password",
            autoComplete: "new-password",
            name: "password",
            onChange: handleFieldChange("password"),
            placeholder: "Create a strong password",
            type: "password",
            value: formState.password,
          },
          {
            label: "Confirm Password",
            autoComplete: "new-password",
            name: "confirmPassword",
            onChange: handleFieldChange("confirmPassword"),
            placeholder: "Confirm your password",
            type: "password",
            value: formState.confirmPassword,
          },
        ]}
        footerLinkLabel="Sign in"
        footerLinkTo="/auth/login"
        footerText="Already registered?"
        formClassName="px-6 pb-6 pt-7"
        maxWidthClassName="sm:max-w-[760px]"
        onAction={handleSubmit}
        subtitle="Create your vendor account and start managing orders."
        title="Vendor Registration"
      />
    </AuthLayout>
  );
}
