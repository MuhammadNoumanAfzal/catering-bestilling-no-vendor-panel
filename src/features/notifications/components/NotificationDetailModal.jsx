import OrderNotificationDetail from "./OrderNotificationDetail";
import GenericNotificationDetail from "./GenericNotificationDetail";

export default function NotificationDetailModal({
  notification,
  onClose,
  isLoading = false,
}) {
  if (!notification) {
    return null;
  }

  if (notification.type === "ORDER") {
    return (
      <OrderNotificationDetail
        isLoading={isLoading}
        notification={notification}
        onClose={onClose}
      />
    );
  }

  return (
    <GenericNotificationDetail
      isLoading={isLoading}
      notification={notification}
      onClose={onClose}
    />
  );
}
