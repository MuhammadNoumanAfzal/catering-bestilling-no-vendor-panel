import { X } from "lucide-react";
import { Fragment } from "react";
import { deriveReviewRows } from "../api/notificationsMappers";

export default function GenericNotificationDetail({
  notification,
  onClose,
  isLoading = false,
}) {
  const rows =
    notification.type === "REVIEW"
      ? deriveReviewRows(notification)
      : notification.detailRows;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-5">
      <div className="w-full max-w-[440px] rounded-[20px] border border-[#eee2d8] bg-white p-4 shadow-[0_20px_44px_rgba(0,0,0,0.22)] sm:p-4.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d86f39]">{notification.detailTitle}</p>
            <h2 className="mt-1 text-[22px] font-extrabold leading-[1.15] text-[#1c1510]">{notification.title}</h2>
          </div>
          <button
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#efe2d8] bg-[#fffaf6] text-[#473d36] transition hover:bg-white"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-2.5 text-[14px] leading-6 text-[#6f6258]">{notification.message}</p>

        <div className="mt-3 rounded-[16px] border border-[#ece1d8] bg-[linear-gradient(180deg,#fffaf6_0%,#ffffff_100%)] p-3">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#ecdcd0]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#ecdcd0]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#ecdcd0]" />
            </div>
          ) : (
            <div className="grid grid-cols-[minmax(108px,0.72fr)_1fr] gap-x-3 gap-y-2.5 max-[520px]:grid-cols-1">
              {rows.map((row) => (
                <Fragment key={`${notification.id}-${row.label}`}>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b7d72]">{row.label}</span>
                  <span className="text-[13px] font-semibold leading-5 text-[#241c16]">{row.value}</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-[12px] bg-[#d86f39] px-4 text-[13px] font-semibold text-white transition active:scale-95"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
