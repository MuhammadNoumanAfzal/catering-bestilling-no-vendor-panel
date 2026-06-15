import { CircleCheckBig } from "lucide-react";
import DetailPanel from "./DetailPanel";

export default function ConfirmedLifecyclePanel({
  statusTitle,
  statusSubtitle,
  actions,
  onActionClick,
  onOrderAdjustmentClick,
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
            className={`min-h-[30px] rounded border text-[11px] font-bold ${
              action.primary
                ? "border-[#cf6e38] bg-[#cf6e38] text-white"
                : "border-[#d8cec4] bg-white text-[#2b231e]"
            }`}
            onClick={() => onActionClick?.(action)}
            type="button"
          >
            {action.label}
          </button>
        ))}
        <button
          className="min-h-[30px] rounded border text-[11px] font-bold border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4] transition"
          onClick={onOrderAdjustmentClick}
          type="button"
        >
          Order Adjustment
        </button>
      </div>
    </DetailPanel>
  );
}
