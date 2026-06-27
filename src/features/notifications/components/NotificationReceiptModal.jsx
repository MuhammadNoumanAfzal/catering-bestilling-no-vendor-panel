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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6">
      <div className="w-full max-w-[540px] rounded-[16px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#ede3db] pb-4">
          <div>
            <p className="type-subpara m-0 text-[#d86f39]">Payment Receipt</p>
            <h2 className="type-h4 mt-1 text-[#1c1510]">{notification.title}</h2>
          </div>
          <button className="text-[#473d36]" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 rounded-[14px] bg-[#fff5ef] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="type-subpara m-0 text-[#8e7f73]">Amount Received</p>
              <p className="type-h3 mt-1 text-[#1d1611]">
                {amount || (isLoading ? "Loading..." : "--")}
              </p>
            </div>
            <span className="type-subpara rounded-full bg-white px-3 py-[6px] text-[#2f8a4b]">
              {status}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(120px,0.8fr)_1fr] gap-x-4 gap-y-3 max-[520px]:grid-cols-1">
          {notification.detailRows.map((row) => (
            <Fragment key={`${notification.id}-${row.label}`}>
              <span className="type-subpara text-[#8b7d72]">{row.label}</span>
              <span className="type-subpara text-[#241c16]">{row.value}</span>
            </Fragment>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 max-[520px]:flex-col max-[520px]:items-stretch">
          <button
            className="type-subpara inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#d8ccc3] bg-white px-4 py-[9px] text-[#241c16] disabled:cursor-not-allowed disabled:opacity-50"
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
            className="type-subpara rounded-[8px] bg-[#d86f39] px-4 py-[9px] text-white"
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
