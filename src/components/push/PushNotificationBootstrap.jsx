import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { executeProtectedGraphqlRequest } from "../../app/api/protectedGraphqlClient";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { startFirebasePush } from "../../lib/push/firebasePush";
import { showNewNotificationToast } from "../../utils/vendorAlerts";

const REGISTER_DEVICE_TOKEN_MUTATION = `
  mutation RegisterDeviceToken($deviceToken: String!, $deviceType: String!) {
    deviceToken(deviceToken: $deviceToken, deviceType: $deviceType) {
      success
      message
    }
  }
`;

function getPushLink(payload) {
  const link = String(payload?.data?.link || payload?.fcmOptions?.link || "").trim();

  // The API guide uses /vendor/orders, but this standalone portal serves orders at /orders.
  return link.replace(/^\/vendor\/orders(?=\/|$)/, "/orders");
}

function openPushLink(link, navigate) {
  if (!link) {
    return;
  }

  try {
    const target = new URL(link, window.location.origin);

    if (target.origin === window.location.origin) {
      navigate(`${target.pathname}${target.search}${target.hash}`);
      return;
    }

    window.location.assign(target.href);
  } catch {
    navigate(link);
  }
}

export default function PushNotificationBootstrap() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return undefined;
    }

    let unsubscribe = () => {};
    let isDisposed = false;
    const storageKey = `gocatering:fcm:vendor:${user.id}`;

    async function enablePush() {
      try {
        const { token, unsubscribe: stopListening } = await startFirebasePush((payload) => {
          const title = payload?.notification?.title || payload?.data?.title || "New notification";
          const body = payload?.notification?.body || payload?.data?.body || "You have a new update.";
          const link = getPushLink(payload);

          void showNewNotificationToast(title, body).then((result) => {
            if (result.isConfirmed) {
              openPushLink(link, navigate);
            }
          });
        });
        unsubscribe = stopListening;

        if (!token || window.localStorage.getItem(storageKey) === token || isDisposed) {
          return;
        }

        const result = await executeProtectedGraphqlRequest(REGISTER_DEVICE_TOKEN_MUTATION, {
          deviceToken: token,
          deviceType: "WEB",
        });
        const payload = result?.deviceToken;

        if (!payload?.success) {
          throw new Error(payload?.message || "Unable to register this device for notifications.");
        }

        window.localStorage.setItem(storageKey, token);
      } catch (error) {
        console.warn("Firebase push setup was skipped:", error?.message || error);
      }
    }

    void enablePush();
    return () => {
      isDisposed = true;
      unsubscribe();
    };
  }, [isAuthenticated, navigate, user?.id]);

  return null;
}
