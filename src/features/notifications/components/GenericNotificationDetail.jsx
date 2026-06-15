import { X } from "lucide-react";
import { Fragment } from "react";

export default function GenericNotificationDetail({ notification, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6">
      <div className="w-full max-w-[520px] rounded-[16px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="type-subpara m-0 text-[#d86f39]">{notification.detailTitle}</p>
            <h2 className="type-h4 mt-1 text-[#1c1510]">{notification.title}</h2>
          </div>
          <button className="text-[#473d36] cursor-pointer" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        <p className="type-para mt-3 text-[#6f6258]">{notification.message}</p>

        <div className="mt-4 rounded-[12px] border border-[#ece1d8] bg-[#fffaf6] p-4">
          <div className="grid grid-cols-[minmax(120px,0.8fr)_1fr] gap-x-4 gap-y-3 max-[520px]:grid-cols-1">
            {notification.detailRows.map((row) => (
              <Fragment key={`${notification.id}-${row.label}`}>
                <span className="type-subpara text-[#8b7d72]">{row.label}</span>
                <span className="type-subpara text-[#241c16]">{row.value}</span>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="type-subpara rounded-[8px] bg-[#d86f39] px-4 py-[9px] text-white cursor-pointer active:scale-95 transition"
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
