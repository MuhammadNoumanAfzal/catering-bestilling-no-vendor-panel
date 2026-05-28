import Swal from "sweetalert2";

const BRAND_ORANGE = "#cf6e38";
const POPUP_BACKGROUND = "#fffaf6";
const TEXT_COLOR = "#201b17";
const MUTED_BUTTON = "#d7cec6";
const SOFT_ORANGE = "#f0b79e";

function withBaseOptions(options) {
  return {
    background: POPUP_BACKGROUND,
    color: TEXT_COLOR,
    confirmButtonColor: BRAND_ORANGE,
    reverseButtons: true,
    ...options,
  };
}

export function showVendorSuccessToast(title) {
  return Swal.fire(
    withBaseOptions({
      toast: true,
      position: "top-end",
      icon: "success",
      title,
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
    }),
  );
}

export function showVendorErrorAlert(message, title = "Something went wrong") {
  return Swal.fire(
    withBaseOptions({
      icon: "error",
      title,
      text: message,
      confirmButtonText: "Try again",
    }),
  );
}

export function confirmVendorAction({
  title,
  text,
  confirmButtonText,
  cancelButtonText = "Cancel",
  icon = "question",
  confirmButtonColor = BRAND_ORANGE,
}) {
  return Swal.fire(
    withBaseOptions({
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor,
      cancelButtonColor: MUTED_BUTTON,
    }),
  );
}

export function confirmVendorLogout() {
  return confirmVendorAction({
    title: "Log out now?",
    text: "You will be signed out of your current session.",
    confirmButtonText: "Log out",
    cancelButtonText: "Stay signed in",
  });
}

export function confirmVendorResetSettings() {
  return confirmVendorAction({
    title: "Reset all settings?",
    text: "This will restore all settings to their default values.",
    confirmButtonText: "Reset Settings",
    cancelButtonText: "Cancel",
    icon: "warning",
  });
}

export function confirmVendorDeactivateStore() {
  return confirmVendorAction({
    title: "Deactivate store?",
    text: "Your store will be hidden from customers until reactivated.",
    confirmButtonText: "Deactivate Store",
    cancelButtonText: "Cancel",
    icon: "warning",
  });
}

export function confirmVendorDeleteStore() {
  return Swal.fire(
    withBaseOptions({
      icon: "warning",
      title: "Delete Store Permanently?",
      text: "This action is permanent and cannot be undone. Type DELETE to confirm.",
      input: "text",
      inputPlaceholder: "DELETE",
      showCancelButton: true,
      confirmButtonText: "Delete Permanently",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff2918",
      cancelButtonColor: MUTED_BUTTON,
      inputValidator: (value) => {
        if ((value || "").trim().toUpperCase() !== "DELETE") {
          return "Type DELETE to continue.";
        }

        return undefined;
      },
    }),
  );
}

export function showSupportTicketSubmitted() {
  return Swal.fire(
    withBaseOptions({
      icon: "success",
      title: "Ticket submitted",
      text: "Your support ticket was sent successfully. Our team will review it soon.",
      confirmButtonText: "Continue",
    }),
  );
}

export function showReplyPostedSuccess() {
  return showVendorSuccessToast("Reply posted successfully.");
}

export function promptVendorAuthRequired() {
  return Swal.fire(
    withBaseOptions({
      icon: "info",
      title: "Sign in required",
      text: "Please sign in to continue to the vendor dashboard.",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Sign in",
      denyButtonText: "Help",
      cancelButtonText: "Not now",
      cancelButtonColor: MUTED_BUTTON,
      denyButtonColor: SOFT_ORANGE,
    }),
  );
}
