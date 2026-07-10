export default function NotificationItem({ notification, onOpen }) {
  const isHighlighted = notification.highlighted;

  return (
    <article
      className={`group rounded-[18px] border px-4 py-4 shadow-[0_8px_24px_rgba(44,29,19,0.05)] transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(44,29,19,0.08)] ${
        isHighlighted
          ? "border-[#f2c2a9] bg-[linear-gradient(180deg,#fffaf6_0%,#fff3eb_100%)]"
          : "border-[#ece2d9] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[13px] font-bold ${
            isHighlighted
              ? "bg-[#fff0e7] text-[#cf6e38]"
              : "bg-[#f7f1eb] text-[#8a7b6e]"
          }`}
        >
          {notification.title?.trim()?.charAt(0)?.toUpperCase() || "N"}
        </div>

        <button
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left"
          onClick={() => onOpen(notification)}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="m-0 truncate text-[16px] font-semibold text-[#1e1712]">
                  {notification.title}
                </h3>
                {!notification.isRead ? (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#d96f39]"
                  />
                ) : null}
              </div>

              <p className="mt-1 text-[14px] leading-6 text-[#65594f]">
                {notification.message}
              </p>
            </div>

            <span className="shrink-0 whitespace-nowrap rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#8c7e71] shadow-[inset_0_0_0_1px_rgba(228,215,204,0.8)]">
              {notification.time}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isHighlighted
                  ? "bg-[#fff0e6] text-[#cf6e38]"
                  : "bg-[#f6f1eb] text-[#85776a]"
              }`}
            >
              {notification.isRead ? "Read" : "Unread"}
            </span>

            <span className="text-[12px] font-semibold text-[#302822] transition group-hover:text-[#cf6e38]">
              {notification.actionLabel}
            </span>
          </div>
        </button>
      </div>
    </article>
  );
}
