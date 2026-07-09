import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./app/store";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);

// Auto-recover from chunk load errors caused by new deployments
window.addEventListener("error", (event) => {
  const message = event.message || "";
  if (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module")
  ) {
    window.location.reload();
  }
}, true);

window.addEventListener("unhandledrejection", (event) => {
  const message = event.reason?.message || "";
  if (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module")
  ) {
    window.location.reload();
  }
});
