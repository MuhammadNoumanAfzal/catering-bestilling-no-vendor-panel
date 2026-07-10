import NotificationItem from "./NotificationItem";

export default function NotificationSection({ label, items, onOpen }) {
  return (
    <section className="rounded-[20px] border border-[#ebe1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] p-4 shadow-[0_10px_24px_rgba(44,29,19,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold text-[#1d1713]">{label}</h2>
        <span className="rounded-full bg-[#f7f1eb] px-2.5 py-1 text-[11px] font-semibold text-[#8a7b6e]">
          {items.length}
        </span>
      </div>

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
