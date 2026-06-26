import { store } from "../store";
import { executeGraphqlRequest } from "../../features/auth/api/authClient";
import { sessionInvalidated } from "../../features/auth/store/authSlice";
import { clearStoredAuthSession } from "../../features/auth/store/authStorage";

function createSessionExpiredError() {
  const error = new Error("Your session has expired. Please log in again.");
  error.isAuthenticationError = true;
  return error;
}

export function getCurrentAccessToken() {
  return store.getState().auth.accessToken || null;
}

export async function executeProtectedGraphqlRequest(query, variables, options = {}) {
  const accessToken = getCurrentAccessToken();

  if (!accessToken) {
    const error = createSessionExpiredError();
    clearStoredAuthSession();
    store.dispatch(sessionInvalidated());
    throw error;
  }

  try {
    return await executeGraphqlRequest(query, variables, {
      ...options,
      accessToken,
    });
  } catch (error) {
    if (error?.isAuthenticationError) {
      clearStoredAuthSession();
      store.dispatch(sessionInvalidated());
    }

    throw error;
  }
}
