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

  if (queryStr.includes("GetVendorFinanceSummary")) {
    return {
      vendorFinanceSummary: {
        totalEarnings: 495.0,
        netIncome: 445.5,
        platformCommission: 49.5,
        pendingPayouts: 0.0,
        currency: "NOK",
        totalOrders: 2,
        paidOrders: 2,
        pendingOrders: 0
      }
    };
  }

  if (queryStr.includes("GetVendorFinanceOverviewChart")) {
    return {
      vendorFinanceOverviewChart: {
        points: [
          { label: "Point 1", earnings: 165.0, orders: 1 },
          { label: "Point 2", earnings: 330.0, orders: 1 },
          { label: "Point 3", earnings: 495.0, orders: 2 },
          { label: "Point 4", earnings: 0.0, orders: 0 }
        ]
      }
    };
  }

  if (queryStr.includes("GetVendorPayoutStatus")) {
    return {
      vendorPayoutStatus: {
        pendingPayout: {
          title: "Pending Payout",
          description: "Currently being processed",
          amount: 0.0,
          expectedArrival: "2026-07-10",
          currency: "NOK"
        },
        paidAmount: {
          title: "Paid Amount",
          description: "Transferred to bank",
          amount: 445.5,
          currency: "NOK"
        },
        lastPayout: {
          title: "Last Payout",
          description: "Successful payout",
          payoutDate: "2026-07-04",
          amount: 445.5,
          currency: "NOK",
          status: "paid"
        }
      }
    };
  }

  if (queryStr.includes("GetVendorFinanceTransactions")) {
    return {
      vendorFinanceTransactions: {
        edges: [
          {
            node: {
              id: "1",
              orderId: "ORD-11",
              customerName: "Private Client",
              eventType: "Catering",
              eventDate: "2026-07-04",
              grossAmount: 330.0,
              commissionAmount: 33.0,
              netAmount: 297.0,
              currency: "NOK",
              payoutStatus: "paid",
              createdOn: "2026-07-04T12:00:00Z"
            }
          },
          {
            node: {
              id: "2",
              orderId: "ORD-10",
              customerName: "Private Client",
              eventType: "Catering",
              eventDate: "2026-07-04",
              grossAmount: 165.0,
              commissionAmount: 16.5,
              netAmount: 148.5,
              currency: "NOK",
              payoutStatus: "paid",
              createdOn: "2026-07-04T12:00:00Z"
            }
          }
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: "Mg=="
        },
        totalCount: 2
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

  if (queryStr.includes("GetVendorCustomerOrderHistory") || queryStr.includes("vendorCustomerOrderHistory")) {
    return {
      vendorCustomerOrderHistory: [
        {
          id: "8",
          orderNumber: "ORD-8",
          status: "Confirmed",
          statusLabel: "Confirmed",
          statusTone: "warning",
          deliveryDate: "2026-07-04",
          placedAt: "2026-07-04T10:00:00Z",
          guestCount: 10,
          finalPrice: "165.00",
          eventName: "John's Lunch"
        },
        {
          id: "9",
          orderNumber: "ORD-9",
          status: "Delivered",
          statusLabel: "Delivered",
          statusTone: "success",
          deliveryDate: "2026-07-04",
          placedAt: "2026-07-04T11:00:00Z",
          guestCount: 20,
          finalPrice: "330.00",
          eventName: "Pizza Party"
        }
      ]
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
