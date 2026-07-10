import { store } from "../store";
import { executeGraphqlRequest } from "../../features/auth/api/authClient";
import { sessionInvalidated } from "../../features/auth/store/authSlice";
import { clearStoredAuthSession, loadStoredAuthSession } from "../../features/auth/store/authStorage";

function createSessionExpiredError() {
  const error = new Error("Your session has expired. Please log in again.");
  error.isAuthenticationError = true;
  return error;
}

export function getCurrentAccessToken() {
  return store.getState().auth.accessToken || loadStoredAuthSession().accessToken || null;
}

export async function executeProtectedGraphqlRequest(query, variables, options = {}) {
  const accessToken = getCurrentAccessToken();

  if (!accessToken) {
    const error = createSessionExpiredError();
    clearStoredAuthSession();
    store.dispatch(sessionInvalidated());
    throw error;
  }

  const queryStr = String(query || "");

  try {
    console.log("[GraphQL Request] Query:", queryStr.slice(0, 100).replace(/\s+/g, ' '), "Variables:", JSON.stringify(variables));
    const result = await executeGraphqlRequest(query, variables, {
      ...options,
      accessToken,
    });

    return result;
  } catch (error) {
    if (error?.isAuthenticationError) {
      clearStoredAuthSession();
      store.dispatch(sessionInvalidated());
    }

    throw error;
  }
}
