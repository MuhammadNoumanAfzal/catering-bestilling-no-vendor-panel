import {
  LOGIN_USER_MUTATION,
  LOGOUT_USER_MUTATION,
  PASSWORD_RESET_MAIL_MUTATION,
  REGISTER_VENDOR_MUTATION,
  RESET_PASSWORD_MUTATION,
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
    role: user.role,
    companyName: user.companyName ?? "",
    postCode: user.postCode ?? null,
    isActive: Boolean(user.isActive),
  };
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

  if (!normalizedUser?.isActive) {
    throw new Error("Your vendor account is inactive. Please contact support.");
  }

  if (!isAllowedAuthRole(normalizedUser?.role)) {
    throw new Error("This portal is restricted to vendor accounts.");
  }

  return {
    accessToken: loginUser.access,
    user: normalizedUser,
  };
}

export async function registerVendorRequest(formValues) {
  const data = await executeGraphqlRequest(REGISTER_VENDOR_MUTATION, {
    email: formValues.email.trim(),
    phone: formValues.phone.trim(),
    password: formValues.password,
    role: AUTH_ROLE,
    firstName: formValues.firstName.trim(),
    lastName: formValues.lastName.trim(),
    companyName: formValues.companyName.trim(),
    postCode: Number(formValues.postCode),
  });

  const registerUser = data?.registerUser;

  if (!registerUser?.success) {
    throw new Error(registerUser?.message || "Registration failed. Please try again.");
  }

  return {
    message: registerUser.message || "Vendor account created successfully.",
    user: normalizeUser(registerUser.user),
  };
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
