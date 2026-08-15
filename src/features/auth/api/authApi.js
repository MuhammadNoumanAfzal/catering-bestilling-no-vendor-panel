import {
  LOGIN_USER_MUTATION,
  LOGOUT_USER_MUTATION,
  PASSWORD_RESET_MAIL_MUTATION,
  RESET_PASSWORD_MUTATION,
  SEND_SIGNUP_OTP_MUTATION,
  VERIFY_SIGNUP_OTP_MUTATION,
  VERIFY_RESET_CODE_MUTATION,
} from "./authQueries";
import { executeGraphqlRequest } from "./authClient";
import { AUTH_ROLE, isAllowedAuthRole } from "../authConfig";

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: `${user.role ?? ""}`.trim().toLowerCase(),
    companyName: user.companyName ?? "",
    postCode: user.postCode ?? null,
    isActive: Boolean(user.isActive),
    applicationStatus: user.applicationStatus ?? "",
    vendorStatus: user.vendorStatus ?? "",
    status: user.status ?? "",
  };
}

function resolveVendorAccessError(user) {
  const applicationStatus = `${user?.applicationStatus ?? ""}`.trim().toUpperCase();
  const vendorStatus = `${user?.vendorStatus ?? user?.status ?? ""}`.trim().toUpperCase();

  if (applicationStatus === "PENDING_APPROVAL" || vendorStatus === "PENDING_APPROVAL") {
    return "Your vendor account is pending admin approval. You can sign in after approval.";
  }

  if (applicationStatus === "REVIEWING") {
    return "Your vendor application is under review. Please wait for admin approval.";
  }

  if (applicationStatus === "CHANGES_REQUESTED") {
    return "Your vendor application needs changes before approval. Please contact support or admin.";
  }

  if (applicationStatus === "REJECTED") {
    return "Your vendor application was rejected. Please contact support for help.";
  }

  if (vendorStatus === "SUSPENDED" || applicationStatus === "SUSPENDED") {
    return "Your vendor account is suspended. Please contact support.";
  }

  if (vendorStatus === "DEACTIVATED" || applicationStatus === "DEACTIVATED") {
    return "Your vendor account is deactivated. Please contact support.";
  }

  return "Your vendor account is inactive. Please contact support.";
}

export function getVendorPostLoginPath(user) {
  const applicationStatus = `${user?.applicationStatus ?? ""}`.trim().toUpperCase();
  const vendorStatus = `${user?.vendorStatus ?? user?.status ?? ""}`.trim().toUpperCase();

  if (["ACTIVE", "APPROVED"].includes(applicationStatus) || ["ACTIVE", "APPROVED"].includes(vendorStatus)) {
    return "/dashboard";
  }

  // Allow non-approved vendors to sign in and complete their business profile.
  return "/settings";
}

export async function loginUserRequest({ identifier, password }) {
  const data = await executeGraphqlRequest(LOGIN_USER_MUTATION, {
    email: identifier.trim(),
    password,
    role: AUTH_ROLE,
  });

  const loginUser = data?.loginUser;

  if (!loginUser?.success || !loginUser?.access || !loginUser?.user) {
    throw new Error("Login failed. Please verify your credentials and try again.");
  }

  const normalizedUser = normalizeUser(loginUser.user);

  if (!isAllowedAuthRole(normalizedUser?.role)) {
    throw new Error("This portal is restricted to vendor accounts.");
  }

  return {
    accessToken: loginUser.access,
    user: normalizedUser,
  };
}

export async function sendSignupOtpRequest(formValues) {
  const data = await executeGraphqlRequest(SEND_SIGNUP_OTP_MUTATION, {
    input: {
      email: formValues.email.trim().toLowerCase(),
      phone: formValues.phone.trim(),
      password: formValues.password,
      role: AUTH_ROLE,
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      companyName: formValues.companyName.trim(),
      postCode: Number(formValues.postCode),
    },
  });

  const result = data?.sendSignupOtp;

  if (!result?.success) {
    throw new Error(result?.message || "Unable to send verification code right now.");
  }

  return {
    message: result.message || "Verification code sent successfully.",
  };
}

export async function verifySignupOtpRequest({ email, otp }) {
  const data = await executeGraphqlRequest(VERIFY_SIGNUP_OTP_MUTATION, {
    input: {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    },
  });

  const result = data?.verifySignupOtp;

  if (!result?.success) {
    throw new Error(result?.message || "Verification failed. Please try again.");
  }

  return {
    message:
      result.message ||
      "Vendor account created successfully. Your account is pending admin approval.",
    user: normalizeUser(result.user),
  };
}

export async function registerVendorRequest(formValues) {
  return verifySignupOtpRequest({
    email: formValues.email,
    otp: `${formValues.otp ?? ""}`,
  });
}

export async function logoutUserRequest(accessToken) {
  const data = await executeGraphqlRequest(
    LOGOUT_USER_MUTATION,
    {},
    { accessToken },
  );

  const result = data?.logoutUser;

  if (!result?.success) {
    throw new Error(result?.message || "Unable to log out right now.");
  }

  return {
    message: result.message || "Successfully Logout",
  };
}

export async function requestPasswordResetMail({ email }) {
  const data = await executeGraphqlRequest(PASSWORD_RESET_MAIL_MUTATION, {
    email: email.trim(),
    role: AUTH_ROLE,
  });

  const result = data?.passwordResetMail;

  if (!result?.success) {
    throw new Error(result?.message || "Unable to send reset code right now.");
  }

  return {
    message: result.message || "Reset code sent successfully.",
  };
}

export async function verifyPasswordResetCode({ email, pin }) {
  const data = await executeGraphqlRequest(VERIFY_RESET_CODE_MUTATION, {
    email: email.trim(),
    pin: pin.trim(),
  });

  const result = data?.verifyResetCode;

  if (!result?.success) {
    throw new Error(result?.message || "Verification failed. Please try again.");
  }

  return {
    message: result.message || "Code verified successfully.",
  };
}

export async function resetPasswordRequest({ email, token, password }) {
  const data = await executeGraphqlRequest(RESET_PASSWORD_MUTATION, {
    email: email.trim(),
    token: token.trim(),
    password1: password,
    password2: password,
  });

  const result = data?.resetPassword;

  if (!result?.success) {
    throw new Error(result?.message || "Password reset failed. Please try again.");
  }

  return {
    message: result.message || "Password updated successfully.",
  };
}
