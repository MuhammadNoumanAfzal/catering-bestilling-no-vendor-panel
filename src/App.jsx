import AppRouter from "./app/router/AppRouter";
import ScrollToTop from "./app/router/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppRouter />
    </>
  );
}
