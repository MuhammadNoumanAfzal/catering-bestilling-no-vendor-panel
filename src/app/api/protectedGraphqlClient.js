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



  if (queryStr.includes("vendorNotificationCounts")) {
    return {
      vendorNotificationCounts: {
        total: 1,
        unread: 1,
        read: 0
      }
    };
  }

  if (queryStr.includes("GetVendorNotifications") || queryStr.includes("vendorNotifications")) {
    return {
      vendorNotifications: {
        edges: [
          {
            node: {
              id: "1",
              notificationType: "VENDOR_PRODUCT_ORDERED",
              title: "Product added",
              message: "Company 'Private Client' ordered your product -> 'Special Vendor Pizza'",
              isRead: false,
              createdAt: new Date().toISOString(),
              orderId: "36",
              reviewId: null
            },
            cursor: "MS=="
          }
        ],
        totalCount: 1,
        unreadCount: 1,
        pageInfo: {
          hasNextPage: false,
          endCursor: "MS=="
        }
      }
    };
  }


  try {
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
