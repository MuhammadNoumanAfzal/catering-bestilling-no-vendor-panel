import { CircleCheckBig } from "lucide-react";
import DetailPanel from "./DetailPanel";

export default function ConfirmedLifecyclePanel({ statusTitle, statusSubtitle, actions }) {
  return (
    <DetailPanel title="Order Lifecycle">
      <div className="mb-3 flex flex-col items-center gap-1.5 text-center">
        <CircleCheckBig className="text-[#21a44d]" size={30} strokeWidth={2.2} />
        <strong className="text-[13px] font-extrabold text-[#17120e]">{statusTitle}</strong>
        <p className="m-0 text-[10px] font-semibold leading-[1.35] text-[#8a7a6d]">
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
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </DetailPanel>
  );
}
