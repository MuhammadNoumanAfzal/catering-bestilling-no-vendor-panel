const GRAPHQL_API_URL = import.meta.env.VITE_GRAPHQL_API_URL;

function getErrorMessage(payload, fallbackMessage) {
  const firstError = payload?.errors?.[0];
  const fieldErrors = firstError?.extensions?.errors;

  if (fieldErrors && typeof fieldErrors === "object") {
    const firstFieldMessage = Object.values(fieldErrors).find(
      (value) => typeof value === "string" && value.trim(),
    );

    if (firstFieldMessage) {
      return firstFieldMessage;
    }
  }

  if (firstError?.message) {
    return firstError.message;
  }

  return fallbackMessage;
}

export function isAuthenticationError(payload) {
  const firstError = payload?.errors?.[0];
  const code = firstError?.extensions?.code;
  const message = firstError?.message?.toLowerCase?.() || "";

  return (
    code === "invalid_token" ||
    code === "permission_denied" ||
    code === "authentication_failed" ||
    message.includes("authorization") ||
    message.includes("authentication") ||
    message.includes("token") ||
    message.includes("login required")
  );
}

export async function executeGraphqlRequest(query, variables, options = {}) {
  if (!GRAPHQL_API_URL) {
    throw new Error("Missing VITE_GRAPHQL_API_URL. Add it to your environment configuration.");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (options.accessToken) {
    headers.Authorization = `JWT ${options.accessToken}`;
  }

  const response = await fetch(GRAPHQL_API_URL, {
    method: "POST",
    headers,
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
    const error = new Error(getErrorMessage(payload, "Authentication request failed."));
    error.isAuthenticationError = isAuthenticationError(payload);
    throw error;
  }

  return payload?.data ?? null;
}
