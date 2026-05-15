import { ChevronDown, Users } from "lucide-react";

const statusToneClasses = {
  "is-new": "bg-[#fff0c6] text-[#c88b00]",
  "is-ready": "bg-[#d7f4dc] text-[#299b48]",
  "is-preparing": "bg-[#f0dcff] text-[#b00df5]",
  "is-accepted": "bg-[#dde7ff] text-[#4470dc]",
  "is-delivery": "bg-[#ffe1d8] text-[#d66c3a]",
  "is-reject": "bg-[#f1d7ef] text-[#9a4d93]",
  "is-canceled": "bg-[#ffd6d6] text-[#ca3131]",
  "is-delivered": "bg-[#dff7d9] text-[#248d32]",
};

const actionToneClasses = {
  "is-primary": "border-[#cf6e38] bg-[#cf6e38] text-white",
  "is-muted": "border-[#9a948e] bg-[#9a948e] text-white",
  "is-success": "border-[#7ce267] bg-[#7ce267] text-[#124f0f]",
};

export default function OrdersTable({ rows, onActionClick }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#e9e1d8]">
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
            <tr key={`${row.id}-${row.customer}-${index}`}>
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
                  {row.actions.map((action) => (
                    <button
                      key={action.label}
                      className={`inline-flex min-h-[22px] items-center gap-1 rounded-full border px-[10px] text-[11px] leading-none ${actionToneClasses[action.tone] ?? actionToneClasses["is-muted"]} ${
                        action.hasDropdown ? "pr-2" : ""
                      }`}
                      onClick={() => onActionClick(row, action)}
                      type="button"
                    >
                      <span>{action.label}</span>
                      {action.hasDropdown ? <ChevronDown size={10} strokeWidth={2.4} /> : null}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
