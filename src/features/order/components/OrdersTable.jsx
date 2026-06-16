import { ChevronDown, Users, Check, X, ArrowRight, Ban, Play } from "lucide-react";
import { useState } from "react";

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

const actionToneClasses = {
  "is-primary": "border-[#cf6e38] bg-[#cf6e38] text-white hover:bg-[#cf6e38]/90",
  "is-muted": "border-[#8f8881] bg-[#8f8881] text-white hover:bg-[#8f8881]/90",
  "is-success": "border-[#2ca24f] bg-[#2ca24f] text-white hover:bg-[#2ca24f]/90",
  "is-danger": "border-[#dc2626] bg-[#dc2626] text-white hover:bg-[#dc2626]/90",
};

const actionMenuItems = [
  "Start preparing",
  "Ready",
  "Out for delivery",
  "Delivered",
  "Canceled",
];

function renderStatusBadge(status, statusTone) {
  const toneClass = statusToneClasses[statusTone] ?? statusToneClasses["is-new"];
  
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
      <span>{status}</span>
    </span>
  );
}

function getActionIcon(label) {
  const norm = label.toLowerCase();
  if (norm === "accept" || norm === "accept order") {
    return <Check size={12} strokeWidth={3} className="mr-0.5 shrink-0" />;
  }
  if (norm === "reject" || norm === "reject order" || norm === "cancel" || norm === "canceled") {
    return <X size={12} strokeWidth={3} className="mr-0.5 shrink-0" />;
  }
  if (norm === "start preparing" || norm === "preparing") {
    return <Play size={12} strokeWidth={2.5} className="mr-0.5 shrink-0" fill="currentColor" />;
  }
  if (norm === "ready") {
    return <Check size={12} strokeWidth={3} className="mr-0.5 shrink-0" />;
  }
  if (norm === "out for delivery" || norm === "delivered" || norm === "mark delivered") {
    return <ArrowRight size={12} strokeWidth={2.5} className="mr-0.5 shrink-0" />;
  }
  return null;
}

export default function OrdersTable({ rows, onActionClick, onRowClick }) {
  const [openMenuKey, setOpenMenuKey] = useState(null);

  function handleMenuToggle(menuKey) {
    setOpenMenuKey((currentKey) => (currentKey === menuKey ? null : menuKey));
  }

  function handleMenuAction(row, action, nextLabel) {
    setOpenMenuKey(null);
    onActionClick(row, { ...action, label: nextLabel, fromDropdown: true });
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
            {["OrderID", "Customer", "Event", "Guests", "Delivery date", "Status", "Actions"].map((heading) => (
              <th
                key={heading}
                className="border-b border-[#eee7df] px-4 py-4 text-left text-[15px] font-extrabold text-[#17120e]"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.id}-${row.customer}-${index}`}
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
                {row.id}
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
                {renderStatusBadge(row.status, row.statusTone)}
              </td>
              <td 
                className="px-4 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {row.actions.map((action) => {
                    const menuKey = `${row.id}-${action.label}`;
                    const isMenuOpen = openMenuKey === menuKey;
                    const hasDropdown = Boolean(action.hasDropdown);
 
                    // Add special custom styling for Accept vs Reject
                    let buttonToneClass = actionToneClasses[action.tone] ?? actionToneClasses["is-muted"];
                    if (action.label === "Accept") {
                      buttonToneClass = "border-[#2ca24f] bg-[#2ca24f] text-white hover:bg-[#21873f] shadow-[0_2px_8px_rgba(44,162,79,0.2)]";
                    } else if (action.label === "Reject") {
                      buttonToneClass = "border-[#e4d9cf] bg-white text-[#dc2626] hover:bg-[#fff2f1] hover:border-[#ffd0cc]";
                    }
 
                    return (
                      <div key={action.label} className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`inline-flex min-h-[28px] cursor-pointer items-center gap-1 rounded-full border px-3.5 text-[13px] font-extrabold leading-none transition duration-150 ${buttonToneClass} ${hasDropdown ? "pr-2" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasDropdown) {
                              handleMenuToggle(menuKey);
                            } else {
                              onActionClick(row, action);
                            }
                          }}
                          type="button"
                        >
                          {getActionIcon(action.label)}
                          <span>{action.label}</span>
                          {hasDropdown ? <ChevronDown size={12} strokeWidth={2.8} className="opacity-90" /> : null}
                        </button>
 
                        {hasDropdown && isMenuOpen ? (
                          <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[150px] rounded-[10px] border border-[#e3d6ca] bg-white/95 p-1 shadow-[0_12px_28px_rgba(38,23,14,0.12)] backdrop-blur-sm">
                            {actionMenuItems.map((item) => (
                              <button
                                key={item}
                                className="flex w-full items-center gap-1.5 cursor-pointer whitespace-nowrap rounded-[6px] px-3 py-2 text-left text-[12px] font-bold text-[#5e554d] transition hover:bg-[#f6f1eb] hover:text-[#cf6e38]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuAction(row, action, item);
                                }}
                                type="button"
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  item === "Start preparing" ? "bg-[#cf6e38]" :
                                  item === "Ready" ? "bg-[#1c873b]" :
                                  item === "Out for delivery" ? "bg-[#c4551d]" :
                                  item === "Delivered" ? "bg-[#156e10]" : "bg-[#dc2626]"
                                }`} />
                                <span>{item}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
