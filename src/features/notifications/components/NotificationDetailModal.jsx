import OrderNotificationDetail from "./OrderNotificationDetail";
import GenericNotificationDetail from "./GenericNotificationDetail";

export default function NotificationDetailModal({ notification, onClose }) {
  if (!notification) {
    return null;
  }

  if (notification.type === "order") {
    return <OrderNotificationDetail notification={notification} onClose={onClose} />;
  }

  return <GenericNotificationDetail notification={notification} onClose={onClose} />;
}
