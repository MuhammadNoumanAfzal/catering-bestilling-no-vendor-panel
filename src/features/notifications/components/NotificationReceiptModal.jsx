import { Fragment } from "react";
import { Download, X } from "lucide-react";
import {
  deriveReceiptAmount,
  deriveReceiptStatus,
  deriveReceiptUrl,
} from "../api/notificationsMappers";

export default function NotificationReceiptModal({
  notification,
  onClose,
  isLoading = false,
}) {
  if (!notification) {
    return null;
  }

  const receiptUrl = deriveReceiptUrl(notification);
  const amount = deriveReceiptAmount(notification);
  const status = deriveReceiptStatus(notification);
  const detailRows = Array.isArray(notification.detailRows) ? notification.detailRows : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-5">
      <div className="w-full max-w-[450px] rounded-[20px] border border-[#eee2d8] bg-white p-4 shadow-[0_20px_44px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#ede3db] pb-3">
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d86f39]">Payment Receipt</p>
            <h2 className="mt-1 text-[22px] font-extrabold leading-[1.15] text-[#1c1510]">{notification.title}</h2>
          </div>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#efe2d8] bg-[#fffaf6] text-[#473d36] transition hover:bg-white"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 rounded-[16px] bg-[#fff5ef] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8e7f73]">Amount Received</p>
              <p className="mt-1 text-[22px] font-extrabold text-[#1d1611]">
                {amount || (isLoading ? "Loading..." : "--")}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-[6px] text-[11px] font-semibold text-[#2f8a4b]">
              {status}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[minmax(108px,0.72fr)_1fr] gap-x-3 gap-y-2.5 max-[520px]:grid-cols-1">
          {detailRows.map((row) => (
            <Fragment key={`${notification.id}-${row.label}`}>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b7d72]">{row.label}</span>
              <span className="text-[13px] font-semibold leading-5 text-[#241c16]">{row.value}</span>
            </Fragment>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 max-[520px]:flex-col max-[520px]:items-stretch">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#d8ccc3] bg-white px-4 text-[13px] font-semibold text-[#241c16] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!receiptUrl}
            onClick={() => {
              if (receiptUrl) {
                window.open(receiptUrl, "_blank", "noopener,noreferrer");
              }
            }}
            type="button"
          >
            <Download size={14} />
            Download
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#d86f39] px-4 text-[13px] font-semibold text-white"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
