import { CircleCheckBig } from "lucide-react";
import DetailPanel from "./DetailPanel";

export default function ConfirmedLifecyclePanel({
  statusTitle,
  statusSubtitle,
  actions,
  onActionClick,
  onOrderAdjustmentClick,
  currentStatus,
  onStatusSelect,
}) {
  return (
    <DetailPanel title="Order Lifecycle">
      <div className="mb-3 flex flex-col items-center gap-2 text-center">
        <CircleCheckBig className="text-[#21a44d]" size={36} strokeWidth={2.2} />
        <strong className="text-[17px] font-extrabold text-[#17120e]">{statusTitle}</strong>
        <p className="m-0 text-[12px] font-semibold leading-[1.4] text-[#8a7a6d]">
          {statusSubtitle}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`min-h-[30px] rounded border text-[11px] font-bold cursor-pointer transition ${
              action.primary
                ? "border-[#cf6e38] bg-[#cf6e38] text-white hover:bg-[#cf6e38]/90"
                : "border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4]"
            }`}
            onClick={() => onActionClick?.(action)}
            type="button"
          >
            {action.label}
          </button>
        ))}
        <button
          className="min-h-[30px] rounded border text-[11px] font-bold border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4] transition cursor-pointer"
          onClick={onOrderAdjustmentClick}
          type="button"
        >
          Order Adjustment
        </button>

        {onStatusSelect && (
          <div className="mt-4 pt-3.5 border-t border-[#e6ddd4] flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8f7f73]">
              Update Status Manually
            </label>
            <div className="relative">
              <select
                className="w-full min-h-[34px] rounded-lg border border-[#d8cec4] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#2b231e] outline-none shadow-[0_1px_3px_rgba(38,23,14,0.02)] transition duration-150 focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] cursor-pointer"
                value={currentStatus || ""}
                onChange={(e) => onStatusSelect(e.target.value)}
              >
                <option value="Accepted">Accepted</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Out for delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled (Reject)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </DetailPanel>
  );
}
