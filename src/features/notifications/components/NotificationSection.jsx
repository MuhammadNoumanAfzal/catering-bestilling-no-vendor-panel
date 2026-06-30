import NotificationItem from "./NotificationItem";

export default function NotificationSection({ label, items, onOpen }) {
  return (
    <section>
      <h2 className="type-h4 mb-2">{label}</h2>
      <div className="flex flex-col gap-3">
        {items.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}
