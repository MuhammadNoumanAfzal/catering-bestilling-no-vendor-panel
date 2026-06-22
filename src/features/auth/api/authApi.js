import { LOGIN_USER_MUTATION, REGISTER_VENDOR_MUTATION } from "./authQueries";

const GRAPHQL_API_URL = import.meta.env.VITE_GRAPHQL_API_URL;

function getErrorMessage(payload, fallbackMessage) {
  if (payload?.errors?.length) {
    return payload.errors[0]?.message || fallbackMessage;
  }

  return fallbackMessage;
}

async function executeGraphqlRequest(query, variables) {
  if (!GRAPHQL_API_URL) {
    throw new Error("Missing VITE_GRAPHQL_API_URL. Add it to your environment configuration.");
  }

  const response = await fetch(GRAPHQL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, "Unable to reach the authentication service right now."),
    );
  }

  if (payload?.errors?.length) {
    throw new Error(getErrorMessage(payload, "Authentication request failed."));
  }

  return payload?.data ?? null;
}

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
  });

  const loginUser = data?.loginUser;

  if (!loginUser?.success || !loginUser?.access || !loginUser?.user) {
    throw new Error("Login failed. Please verify your credentials and try again.");
  }

  return {
    accessToken: loginUser.access,
    user: normalizeUser(loginUser.user),
  };
}

export async function registerVendorRequest(formValues) {
  const data = await executeGraphqlRequest(REGISTER_VENDOR_MUTATION, {
    email: formValues.email.trim(),
    phone: formValues.phone.trim(),
    password: formValues.password,
    role: "vendor",
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
