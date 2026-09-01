const FIREBASE_VERSION = "10.13.2";

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
let firebaseSdkPromise;

function hasFirebaseConfiguration() {
  return Boolean(VAPID_KEY && Object.values(FIREBASE_CONFIG).every(Boolean));
}

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${source}"]`);

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Unable to load Firebase Messaging."));
    document.head.appendChild(script);
  });
}

async function getMessaging() {
  if (!firebaseSdkPromise) {
    firebaseSdkPromise = (async () => {
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`);

      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(FIREBASE_CONFIG);
      }

      return window.firebase.messaging();
    })();
  }

  return firebaseSdkPromise;
}

export async function startFirebasePush(onForegroundMessage) {
  if (
    typeof window === "undefined" ||
    !hasFirebaseConfiguration() ||
    !("serviceWorker" in navigator) ||
    !("Notification" in window)
  ) {
    return { token: null, unsubscribe: () => {} };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { token: null, unsubscribe: () => {} };
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messaging = await getMessaging();
  const token = await messaging.getToken({
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  const unsubscribe = messaging.onMessage((payload) => onForegroundMessage?.(payload));

  return { token: token || null, unsubscribe };
}
