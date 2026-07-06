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

  if (queryStr.includes("GetVendorDashboard")) {
    return {
      me: {
        id: "46",
        firstName: "Nouman",
        lastName: "AFZAL",
        email: "nouman@example.com"
      },
      vendorDashboardSummary: {
        totalOrders: 1,
        upcomingOrders: 1,
        urgentOrders: 1,
        capacityPercent: 0.0,
        totalOrdersTrend: 100.0,
        upcomingOrdersTrend: 100.0,
        urgentOrdersTrend: 100.0,
        capacityTrend: 0.0,
        totalOrdersTimeLabel: "vs last period",
        upcomingOrdersTimeLabel: "vs last period",
        urgentOrdersTimeLabel: "vs last period",
        capacityTimeLabel: "vs last period",
        currency: "NOK"
      },
      vendorUrgentOrders: {
        edges: [
          {
            node: {
              id: "7",
              orderNumber: "ORD-7",
              status: "Confirmed",
              statusLabel: "Confirmed",
              statusTone: "warning",
              deliveryDate: "2026-07-05",
              deliveryWindow: "12:00 - 14:00",
              eventName: "Lunch Event",
              guestCount: 10,
              customerName: "John Doe",
              customerInfo: {
                fullName: "John Doe"
              },
              finalPrice: "165.00"
            }
          }
        ],
        totalCount: 1
      },
      vendorKitchenStatus: {
        preparing: 1,
        ready: 0,
        outForDelivery: 0
      },
      vendorFinanceOverviewChart: {
        points: [
          { label: "Point 1", earnings: 165.0, orders: 1 },
          { label: "Point 2", earnings: 330.0, orders: 1 },
          { label: "Point 3", earnings: 495.0, orders: 2 },
          { label: "Point 4", earnings: 0.0, orders: 0 }
        ]
      },
      vendorReviews: {
        edges: [],
        totalCount: 0
      }
    };
  }


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
