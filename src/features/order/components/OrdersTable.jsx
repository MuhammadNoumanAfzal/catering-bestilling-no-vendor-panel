import { ChevronDown, Eye, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const statusToneClasses = {
  "is-new": "border border-[#bde3f9] bg-[#e3f4ff] text-[#1d70a2]",
  "is-ready": "border border-[#b6f0c6] bg-[#e6fcf0] text-[#1c873b]",
  "is-preparing": "border border-[#e7d4ff] bg-[#f5ecff] text-[#6322ad]",
  "is-accepted": "border border-[#cbdcff] bg-[#ecf2ff] text-[#245ce6]",
  "is-delivery": "border border-[#fcd5c0] bg-[#fff2eb] text-[#c4551d]",
  "is-reject": "border border-[#ffd0cc] bg-[#fff2f1] text-[#dc2626]",
  "is-canceled": "border border-[#ffd0cc] bg-[#fff2f1] text-[#dc2626]",
  "is-delivered": "border border-[#c1f5b6] bg-[#edfcf2] text-[#156e10]",
  "is-modified": "border border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]",
};

const statusToneByLabel = {
  New: "is-new",
  Accepted: "is-accepted",
  Preparing: "is-preparing",
  Ready: "is-ready",
  "Out for delivery": "is-delivery",
  "Out for Delivery": "is-delivery",
  Delivered: "is-delivered",
  Canceled: "is-canceled",
  Modified: "is-modified",
};

const statusActionClasses = {
  Accepted: "border-[#cbdcff] bg-[#ecf2ff] text-[#245ce6] hover:bg-[#dfeaff]",
  Preparing: "border-[#e7d4ff] bg-[#f5ecff] text-[#6322ad] hover:bg-[#eee1ff]",
  Ready: "border-[#b6f0c6] bg-[#e6fcf0] text-[#1c873b] hover:bg-[#d9f8e5]",
  "Out for delivery": "border-[#fcd5c0] bg-[#fff2eb] text-[#c4551d] hover:bg-[#ffe8dc]",
  Delivered: "border-[#c1f5b6] bg-[#edfcf2] text-[#156e10] hover:bg-[#e0f8e7]",
  Canceled: "border-[#ffd0cc] bg-[#fff2f1] text-[#dc2626] hover:bg-[#ffe5e2]",
  Modified: "border-[#fed7aa] bg-[#fff7ed] text-[#ea580c] hover:bg-[#ffefd9]",
};

const statusSequence = ["Accepted", "Preparing", "Ready", "Out for delivery", "Delivered"];

function getNextStatusOptions(currentStatus) {
  const currentIndex = statusSequence.indexOf(currentStatus);

  if (currentIndex === -1 || currentIndex >= statusSequence.length - 1) {
    return [];
  }

  return [statusSequence[currentIndex + 1], "Canceled"];
}

function isTerminalStatus(status) {
  return status === "Delivered" || status === "Canceled";
}

function renderStatusBadge(status, statusTone, t) {
  const toneClass =
    statusToneClasses[statusToneByLabel[status] || statusTone] ?? statusToneClasses["is-new"];
  
  let dotClass = "h-1.5 w-1.5 rounded-full ";
  if (status === "New") {
    dotClass += "bg-[#1d70a2] animate-pulse";
  } else if (status === "Accepted") {
    dotClass += "bg-[#245ce6]";
  } else if (status === "Preparing") {
    dotClass += "bg-[#6322ad] animate-pulse";
  } else if (status === "Ready") {
    dotClass += "bg-[#1c873b]";
  } else if (status === "Out for delivery" || status === "Out for Delivery") {
    dotClass += "bg-[#c4551d] animate-pulse";
  } else if (status === "Delivered") {
    dotClass += "bg-[#156e10]";
  } else if (status === "Modified") {
    dotClass += "bg-[#ea580c] animate-pulse";
  } else {
    dotClass += "bg-[#dc2626]";
  }

  return (
    <span className={`inline-flex min-h-[24px] items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold leading-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${toneClass}`}>
      <span className={dotClass} aria-hidden="true" />
      <span>{t(`orders.${{ New: "new", Accepted: "accepted", Preparing: "preparing", Ready: "ready", "Out for delivery": "outForDelivery", "Out for Delivery": "outForDelivery", Delivered: "delivered", Canceled: "canceled", Modified: "modified" }[status] || "status"}`, { defaultValue: status })}</span>
    </span>
  );
}

export default function OrdersTable({ rows, onActionClick, onRowClick }) {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(null);

  function handleMenuToggle(menuKey, event) {
    const triggerBounds = event.currentTarget.getBoundingClientRect();

    setOpenMenu((currentMenu) => {
      if (currentMenu?.key === menuKey) {
        return null;
      }

      const menuHeight = 180;
      const menuWidth = 190;
      const canOpenBelow = window.innerHeight - triggerBounds.bottom >= menuHeight;
      const top = canOpenBelow
        ? triggerBounds.bottom + 8
        : Math.max(8, triggerBounds.top - menuHeight - 8);
      const left = Math.max(8, Math.min(triggerBounds.right - menuWidth, window.innerWidth - menuWidth - 8));

      return { key: menuKey, left, top };
    });
  }

  function handleMenuAction(row, action) {
    setOpenMenu(null);
    onActionClick(row, action);
  }

  return (
    <div className="overflow-x-auto rounded-[14px] border border-[#ddd3ca] bg-white shadow-[0_2px_10px_rgba(42,27,18,0.05)]">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-[#fffdfb]">
            <th 
              className="w-7 border-b border-[#eee7df] px-4 py-4 text-left text-[15px] font-extrabold text-[#17120e]"
              onClick={(e) => e.stopPropagation()}
            >
              <input 
                className="h-3.5 w-3.5 accent-[#cf6e38] cursor-pointer" 
                type="checkbox" 
                onClick={(e) => e.stopPropagation()}
              />
            </th>
            {[["orderId", "Order ID"], ["customer", "Customer"], ["event", "Event"], ["guests", "Guests"], ["deliveryDate", "Delivery date"], ["status", "Status"], ["actions", "Actions"]].map(([key, heading]) => (
              <th
                key={key}
                className="border-b border-[#eee7df] px-4 py-4 text-left text-[15px] font-extrabold text-[#17120e]"
              >
                {t(`orders.${key}`, { defaultValue: heading })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.rawId || row.id}-${row.customer}-${index}`}
              className={`transition duration-150 cursor-pointer border-b border-[#eee7df] last:border-b-0 hover:bg-[#fff7f2] ${
                row.statusTone === "is-new" ? "bg-[#eef8ff]/70" : "bg-white"
              }`}
              onClick={() => onRowClick?.(row)}
            >
              <td 
                className="w-7 px-4 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  className="h-3.5 w-3.5 accent-[#cf6e38] cursor-pointer" 
                  type="checkbox" 
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="px-4 py-4 text-[16px] font-extrabold text-[#1c1510]">
                {row.displayId || row.id}
              </td>
              <td className="px-4 py-4 text-[15px] font-bold text-[#17120e]">
                {row.customer}
              </td>
              <td className="px-4 py-4 text-[15px] font-semibold text-[#5e544d]">
                {row.event}
              </td>
              <td className="px-4 py-4 text-[15px] font-semibold text-[#17120e]">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={13} strokeWidth={2.2} className="text-[#8f7f73]" />
                  {row.guests}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-0.5 text-[14px] font-semibold leading-[1.25] text-[#5e544d]">
                  <span>{row.date}</span>
                  <span className="text-[12px] text-[#8f7f73] font-medium">{row.time}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {renderStatusBadge(row.status, row.statusTone, t)}
                  {row.hasPendingVendorAdjustment ? (
                    <span className="inline-flex min-h-[24px] items-center rounded-full border border-[#fed0b3] bg-[#fff2e8] px-2.5 py-0.5 text-[11px] font-extrabold leading-none text-[#c95f2a]">
                      {t("orders.modificationPending", { defaultValue: "Modification request pending" })}
                    </span>
                  ) : null}
                </div>
              </td>
              <td 
                className="px-4 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                {row.status === "New" ? (
                  <div className="flex items-center gap-1.5">
                    {row.actions.filter((action) => ["Accept", "Reject"].includes(action.label)).map((action) => (
                      <button
                        className={
                          action.label === "Accept"
                            ? "inline-flex min-h-[34px] cursor-pointer items-center rounded-[9px] bg-[#2ca24f] px-3 text-[12px] font-bold text-white transition hover:bg-[#21873f]"
                            : "inline-flex min-h-[34px] cursor-pointer items-center rounded-[9px] border border-[#e4d9cf] bg-white px-3 text-[12px] font-bold text-[#dc2626] transition hover:border-[#ffd0cc] hover:bg-[#fff2f1]"
                        }
                        key={action.label}
                        onClick={() => onActionClick(row, action)}
                        type="button"
                      >
                        {t(`orders.${action.label === "Accept" ? "accept" : "reject"}`, { defaultValue: action.label })}
                      </button>
                    ))}
                  </div>
                ) : isTerminalStatus(row.status) ? (
                  <button
                    className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-[9px] border border-[#e4d9cf] bg-white px-3 text-[12px] font-bold text-[#4f443d] transition hover:border-[#cf6e38] hover:bg-[#fff7f2] hover:text-[#cf6e38]"
                    onClick={() => onActionClick(row, { label: "View Details", navigateToDetail: true })}
                    type="button"
                  >
                    <Eye size={14} />
                    View details
                  </button>
                ) : (
                <div className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
                  <button
                    aria-expanded={openMenu?.key === row.rawId}
                    className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-[9px] border px-3 text-[12px] font-bold transition ${statusActionClasses[row.status] || "border-[#ded5cd] bg-white text-[#4f443d] hover:border-[#cf6e38] hover:bg-[#fff7f2] hover:text-[#cf6e38]"}`}
                    onClick={(event) => handleMenuToggle(row.rawId, event)}
                    type="button"
                  >
                    {row.status}
                    <ChevronDown size={14} className={openMenu?.key === row.rawId ? "rotate-180 transition-transform" : "transition-transform"} />
                  </button>
                  {openMenu?.key === row.rawId ? (
                    <div className="fixed z-[100] min-w-[190px] rounded-[12px] border border-[#e3d6ca] bg-white p-1.5 shadow-[0_12px_28px_rgba(38,23,14,0.12)]" style={{ left: openMenu.left, top: openMenu.top }}>
                      <button
                        className="flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2.5 text-left text-[12px] font-bold text-[#4f443d] transition hover:bg-[#f6f1eb] hover:text-[#cf6e38]"
                        onClick={() => handleMenuAction(row, { label: "View Details", navigateToDetail: true })}
                        type="button"
                      >
                        <Eye size={14} />
                        View details
                      </button>
                      <div className="my-1 border-t border-[#eee6df]" />
                      <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9a8b80]">
                        Change status
                      </p>
                      {getNextStatusOptions(row.status).map((status) => {
                        return (
                        <button
                          className="flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2.5 text-left text-[12px] font-bold text-[#4f443d] transition hover:bg-[#f6f1eb] hover:text-[#cf6e38]"
                          key={status}
                          onClick={() => handleMenuAction(row, { label: status, fromDropdown: true })}
                          type="button"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status === "Preparing" ? "bg-[#6322ad]" : status === "Ready" ? "bg-[#1c873b]" : status === "Out for delivery" ? "bg-[#c4551d]" : status === "Delivered" ? "bg-[#156e10]" : "bg-[#dc2626]"}`} />
                          {t(`orders.${{ Accepted: "accepted", Preparing: "startPreparing", Ready: "ready", "Out for delivery": "outForDelivery", Delivered: "delivered", Canceled: "canceled" }[status] || "status"}`, { defaultValue: status })}
                        </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
