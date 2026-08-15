const DEFAULT_GRAPHQL_API_URL = "https://api.gocatering.no/graphql/";

const GRAPHQL_API_URL =
  import.meta.env.VITE_GRAPHQL_API_URL ??
  import.meta.env.VITE_GRAPHQL_URL ??
  DEFAULT_GRAPHQL_API_URL;

const GRAPHQL_CONTRACT_ERROR_TRANSLATIONS = [
  {
    pattern: /cannot query field ['"]sendsignupotp['"] on type ['"]mutation['"]/i,
    message:
      "Email OTP signup is not available on the current backend deployment yet.",
  },
  {
    pattern: /cannot query field ['"]registeruser['"] on type ['"]mutation['"]/i,
    message:
      "The new signup flow is not available on the current backend deployment yet.",
  },
];

function getErrorMessage(payload, fallbackMessage) {
  const firstError = payload?.errors?.[0];
  const fieldErrors =
    firstError?.extensions?.fields ?? firstError?.extensions?.errors;

  if (fieldErrors && typeof fieldErrors === "object") {
    const firstFieldMessage = Object.values(fieldErrors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .find((value) => typeof value === "string" && value.trim());

    if (firstFieldMessage) {
      return firstFieldMessage;
    }
  }

  if (firstError?.message) {
    return firstError.message;
  }

  return fallbackMessage;
}

function translateGraphqlContractError(message) {
  if (!message || typeof message !== "string") {
    return message;
  }

  const matchedTranslation = GRAPHQL_CONTRACT_ERROR_TRANSLATIONS.find(({ pattern }) =>
    pattern.test(message),
  );

  return matchedTranslation?.message ?? message;
}

function extractFieldErrors(payload) {
  const rawFieldErrors =
    payload?.errors?.[0]?.extensions?.fields ??
    payload?.errors?.[0]?.extensions?.errors;

  if (!rawFieldErrors || typeof rawFieldErrors !== "object") {
    return null;
  }

  return Object.fromEntries(
    Object.entries(rawFieldErrors).map(([field, value]) => [
      field,
      (Array.isArray(value) ? value : [value]).filter(
        (item) => typeof item === "string" && item.trim(),
      ),
    ]),
  );
}

export function isAuthenticationError(payload) {
  const firstError = payload?.errors?.[0];
  const code = firstError?.extensions?.code;
  const message = firstError?.message?.toLowerCase?.() || "";

  return (
    code === "unauthorized" ||
    code === "invalid_token" ||
    code === "permission_denied" ||
    code === "authentication_failed" ||
    message.includes("unauthorized") ||
    message.includes("not authorized") ||
    message.includes("authorization") ||
    message.includes("authentication") ||
    message.includes("token") ||
    message.includes("login required")
  );
}

export async function executeGraphqlRequest(query, variables, options = {}) {
  if (!GRAPHQL_API_URL) {
    throw new Error(
      "Missing GraphQL endpoint. Add VITE_GRAPHQL_API_URL or VITE_GRAPHQL_URL to your environment configuration.",
    );
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
    const error = new Error(
      translateGraphqlContractError(
        getErrorMessage(payload, "Authentication request failed."),
      ),
    );
    error.isAuthenticationError = isAuthenticationError(payload);
    error.fieldErrors = extractFieldErrors(payload);
    throw error;
  }

  return payload?.data ?? null;
}
