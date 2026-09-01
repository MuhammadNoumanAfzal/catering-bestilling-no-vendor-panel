import AppRouter from "./app/router/AppRouter";
import ScrollToTop from "./app/router/ScrollToTop";
import PushNotificationBootstrap from "./components/push/PushNotificationBootstrap";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <PushNotificationBootstrap />
      <AppRouter />
    </>
  );
}
