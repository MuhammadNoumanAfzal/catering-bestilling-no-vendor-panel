export default function NotificationItem({
  notification,
  onOpenDetail,
  onOpenReceipt,
}) {
  const isHighlighted = notification.tone === "highlight";

  function handleActionClick() {
    if (notification.type === "receipt") {
      onOpenReceipt(notification);
      return;
    }

    onOpenDetail(notification);
  }

  return (
    <article
      className={`rounded-[12px] border px-4 py-3 shadow-[0_2px_8px_rgba(44,29,19,0.04)] ${
        isHighlighted
          ? "border-[#f0b295] bg-[#fff5ef]"
          : "border-[#e7ddd5] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left"
          onClick={handleActionClick}
          type="button"
        >
          <div className="flex items-center gap-2">
            <h3 className="type-h5 m-0 text-[#1e1712]">{notification.title}</h3>
            {!notification.isRead ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-[#d96f39]"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <p className="type-para mt-1">{notification.message}</p>
        </button>

        <span className="type-h6 shrink-0 whitespace-nowrap">
          {notification.time}
        </span>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          className="type-subpara border-0 bg-transparent p-0 text-[#302822] underline-offset-2 hover:underline"
          onClick={handleActionClick}
          type="button"
        >
          {notification.actionLabel}
        </button>
      </div>
    </article>
  );
}
