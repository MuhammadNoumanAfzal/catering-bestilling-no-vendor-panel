import { ChevronDown, Users } from "lucide-react";
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
};

const actionToneClasses = {
  "is-primary": "border-[#cf6e38] bg-[#cf6e38] text-white",
  "is-muted": "border-[#8f8881] bg-[#8f8881] text-white",
  "is-success": "border-[#6ddc56] bg-[#6ddc56] text-[#124f0f]",
};

const actionMenuItems = [
  "Start preparing",
  "Ready",
  "Out for delivery",
  "Delivered",
  "Canceled",
];

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
          <tr>
            <th 
              className="w-7 border-b border-[#eee7df] px-3 py-3.5 text-left text-[14px] font-extrabold text-[#17120e]"
              onClick={(e) => e.stopPropagation()}
            >
              <input 
                className="h-3.5 w-3.5 accent-[#cf6e38]" 
                type="checkbox" 
                onClick={(e) => e.stopPropagation()}
              />
            </th>
            {["OrderID", "Customer", "Event", "Guests", "Delivery date", "Status", "Actions"].map((heading) => (
              <th
                key={heading}
                className="border-b border-[#eee7df] px-3 py-3.5 text-left text-[14px] font-extrabold text-[#17120e]"
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
                row.statusTone === "is-new" ? "bg-[#eef8ff]" : "bg-white"
              }`}
              onClick={() => onRowClick?.(row)}
            >
              <td 
                className="w-7 px-3 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  className="h-3.5 w-3.5 accent-[#cf6e38]" 
                  type="checkbox" 
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="px-3 py-4 text-[15px] font-extrabold text-[#1c1510]">
                {row.id}
              </td>
              <td className="px-3 py-4 text-[14px] font-semibold text-[#17120e]">
                {row.customer}
              </td>
              <td className="px-3 py-4 text-[14px] font-medium text-[#5e544d]">
                {row.event}
              </td>
              <td className="px-3 py-4 text-[14px] font-semibold text-[#17120e]">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={13} strokeWidth={2.2} className="text-[#8f7f73]" />
                  {row.guests}
                </span>
              </td>
              <td className="px-3 py-4">
                <div className="flex flex-col gap-0.5 text-[13px] font-medium leading-[1.25] text-[#5e544d]">
                  <span>{row.date}</span>
                  <span className="text-[11px] text-[#8f7f73]">{row.time}</span>
                </div>
              </td>
              <td className="px-3 py-4">
                <span
                  className={`inline-flex min-h-[24px] items-center justify-center rounded-full border px-3 py-0.5 text-[12px] font-semibold ${
                    statusToneClasses[row.statusTone] ?? statusToneClasses["is-new"]
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td 
                className="px-3 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {row.actions.map((action) => {
                    const menuKey = `${row.id}-${action.label}`;
                    const isMenuOpen = openMenuKey === menuKey;
                    const hasDropdown = Boolean(action.hasDropdown);

                    return (
                      <div key={action.label} className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`inline-flex min-h-[26px] cursor-pointer items-center gap-1 rounded-full border px-3 text-[12px] font-bold leading-none ${
                            actionToneClasses[action.tone] ?? actionToneClasses["is-muted"]
                          } ${hasDropdown ? "pr-2" : ""}`}
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
                          <span>{action.label}</span>
                          {hasDropdown ? <ChevronDown size={12} strokeWidth={2.5} /> : null}
                        </button>

                        {hasDropdown && isMenuOpen ? (
                          <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[140px] rounded-[8px] border border-[#ddd4cb] bg-white p-1 shadow-[0_10px_24px_rgba(25,18,12,0.16)]">
                            {actionMenuItems.map((item) => (
                              <button
                                key={item}
                                className="block w-full cursor-pointer whitespace-nowrap rounded-[5px] px-2.5 py-1.5 text-left text-[11px] font-semibold text-[#5e554d] transition hover:bg-[#f6f1eb]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuAction(row, action, item);
                                }}
                                type="button"
                              >
                                {item}
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
