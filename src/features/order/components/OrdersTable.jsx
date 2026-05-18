import { ChevronDown, Users } from "lucide-react";
import { useState } from "react";

const statusToneClasses = {
  "is-new": "border border-[#9fd8f6] bg-[#d4efff] text-[#1877b9]",
  "is-ready": "bg-[#2fc35b] text-white",
  "is-preparing": "bg-[#d9b8ff] text-[#6f2bbd]",
  "is-accepted": "bg-[#5f88ff] text-white",
  "is-delivery": "bg-[#d56f3c] text-white",
  "is-reject": "bg-[#f7c9ec] text-[#a33980]",
  "is-canceled": "bg-[#dc1010] text-white",
  "is-delivered": "bg-[#5fd84f] text-[#103d0e]",
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

export default function OrdersTable({ rows, onActionClick }) {
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
            <th className="w-7 border-b border-[#eee7df] px-[10px] py-3 text-left text-[13px] font-extrabold text-[#17120e]">
              <input className="h-3 w-3 accent-[#cf6e38]" type="checkbox" />
            </th>
            {["OrderID", "Customer", "Event", "Guests", "Delivery date", "Status", "Actions"].map((heading) => (
              <th
                key={heading}
                className="border-b border-[#eee7df] px-[10px] py-3 text-left text-[13px] font-extrabold text-[#17120e]"
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
              className={row.statusTone === "is-new" ? "bg-[#eef8ff]" : "bg-white"}
            >
              <td className="w-7 border-b border-[#eee7df] px-[10px] py-3 last:border-b-0">
                <input className="h-3 w-3 accent-[#cf6e38]" type="checkbox" />
              </td>
              <td className="border-b border-[#eee7df] px-[10px] py-3 text-[14px] font-extrabold text-[#1c1510] last:border-b-0">
                {row.id}
              </td>
              <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e] last:border-b-0">
                {row.customer}
              </td>
              <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e] last:border-b-0">
                {row.event}
              </td>
              <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e] last:border-b-0">
                <span className="inline-flex items-center gap-1">
                  <Users size={11} strokeWidth={2} />
                  {row.guests}
                </span>
              </td>
              <td className="border-b border-[#eee7df] px-[10px] py-3 last:border-b-0">
                <div className="flex flex-col gap-0.5 text-[11px] font-bold leading-[1.2] text-[#75695f]">
                  <span>{row.date}</span>
                  <span>{row.time}</span>
                </div>
              </td>
              <td className="border-b border-[#eee7df] px-[10px] py-3 last:border-b-0">
                <span
                  className={`inline-flex min-h-[22px] items-center justify-center rounded-full px-[11px] text-[11px] font-bold ${statusToneClasses[row.statusTone]}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="border-b border-[#eee7df] px-[10px] py-3 last:border-b-0">
                <div className="flex flex-wrap gap-1.5">
                  {row.actions.map((action) => {
                    const menuKey = `${row.id}-${action.label}`;
                    const isMenuOpen = openMenuKey === menuKey;
                    const hasDropdown = Boolean(action.hasDropdown);

                    return (
                      <div key={action.label} className="relative">
                        <button
                          className={`inline-flex min-h-[24px] cursor-pointer items-center gap-1 rounded-full border px-[10px] text-[11px] font-semibold leading-none ${actionToneClasses[action.tone] ?? actionToneClasses["is-muted"]} ${
                            hasDropdown ? "pr-2" : ""
                          }`}
                          onClick={() =>
                            hasDropdown ? handleMenuToggle(menuKey) : onActionClick(row, action)
                          }
                          type="button"
                        >
                          <span>{action.label}</span>
                          {hasDropdown ? <ChevronDown size={10} strokeWidth={2.4} /> : null}
                        </button>

                        {hasDropdown && isMenuOpen ? (
                          <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[132px] rounded-[6px] border border-[#ddd4cb] bg-white p-1 shadow-[0_10px_24px_rgba(25,18,12,0.16)]">
                            {actionMenuItems.map((item) => (
                              <button
                                key={item}
                                className="block w-full cursor-pointer whitespace-nowrap rounded-[4px] px-2 py-1 text-left text-[10px] font-medium text-[#5e554d] transition hover:bg-[#f6f1eb]"
                                onClick={() => handleMenuAction(row, action, item)}
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
