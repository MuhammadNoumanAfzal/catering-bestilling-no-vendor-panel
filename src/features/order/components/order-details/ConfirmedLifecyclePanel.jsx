import { 
  Check, 
  CircleCheckBig, 
  CookingPot, 
  PackageCheck, 
  Truck, 
  BadgeCheck, 
  Play, 
  Sliders, 
  AlertTriangle 
} from "lucide-react";
import DetailPanel from "./DetailPanel";

const STAGES = [
  { id: "New", label: "New Order", desc: "Incoming request" },
  { id: "Accepted", label: "Confirmed", desc: "Scheduled for production" },
  { id: "Preparing", label: "Preparing", desc: "Kitchen staff working" },
  { id: "Ready", label: "Food Ready", desc: "Packed & awaiting dispatch" },
  { id: "Out for delivery", label: "In Transit", desc: "Driver on the way" },
  { id: "Delivered", label: "Delivered", desc: "Arrived at customer" },
];

function getStageIndex(status) {
  if (!status) return -1;
  const norm = status.toLowerCase().replace(/[_-]+/g, " ").trim();
  if (norm === "new" || norm === "placed" || norm === "pending") return 0;
  if (norm === "accepted" || norm === "confirmed") return 1;
  if (norm === "preparing" || norm === "in preparation") return 2;
  if (norm === "ready") return 3;
  if (norm === "out for delivery" || norm === "in transit" || norm === "out_for_delivery") return 4;
  if (norm === "delivered" || norm === "completed") return 5;
  return -1; // Canceled/rejected
}

function getActionIcon(label) {
  const norm = label.toLowerCase();
  if (norm.includes("prepare") || norm.includes("preparing")) return CookingPot;
  if (norm.includes("ready")) return PackageCheck;
  if (norm.includes("delivery") || norm.includes("transit")) return Truck;
  if (norm.includes("delivered") || norm.includes("complete")) return BadgeCheck;
  return Play;
}

export default function ConfirmedLifecyclePanel({
  actions,
  onActionClick,
  onOrderAdjustmentClick,
  currentStatus,
  onStatusSelect,
}) {
  const activeIndex = getStageIndex(currentStatus);
  const isCanceled = currentStatus === "Canceled" || currentStatus === "Reject";

  return (
    <DetailPanel title="Order Lifecycle">
      {/* Canceled/Aborted Status View */}
      {isCanceled ? (
        <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#ffd0cc] bg-[#fff2f1] p-4 text-center">
          <AlertTriangle className="text-[#dc2626]" size={32} />
          <strong className="text-[15px] font-extrabold text-[#dc2626]">Order Canceled</strong>
          <p className="m-0 text-[11px] font-semibold text-[#8a7a6d]">
            This order has been rejected or canceled.
          </p>
        </div>
      ) : (
        /* Stepper progress indicator */
        <div className="relative mb-5 flex flex-col gap-4 pl-3.5 mt-2">
          {/* Vertical progress track */}
          <div className="absolute left-[20px] top-[8px] bottom-[8px] w-0.5 bg-[#e6ddd4]" aria-hidden="true" />
          
          {/* Highlighted track */}
          {activeIndex >= 0 && (
            <div 
              className="absolute left-[20px] top-[8px] w-0.5 bg-[#cf6e38] transition-all duration-300" 
              style={{
                height: `${(activeIndex / (STAGES.length - 1)) * 90}%`
              }}
              aria-hidden="true"
            />
          )}

          {STAGES.map((stage, idx) => {
            const isCompleted = activeIndex > idx;
            const isActive = activeIndex === idx;

            let dotWidget = null;
            if (isCompleted) {
              dotWidget = (
                <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#2ca24f] text-white">
                  <Check size={9} strokeWidth={4} />
                </span>
              );
            } else if (isActive) {
              dotWidget = (
                <span className="relative flex h-[15px] w-[15px]">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cf6e38] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-[15px] w-[15px] bg-[#cf6e38]"></span>
                </span>
              );
            } else {
              dotWidget = <span className="h-2.5 w-2.5 rounded-full bg-[#d8cec4] border border-[#c7bbb0]" />;
            }

            return (
              <div key={stage.id} className="relative flex items-center gap-3.5">
                {/* Step indicator aligned container */}
                <div className="flex h-5 w-5 shrink-0 items-center justify-center z-[1] bg-white">
                  {dotWidget}
                </div>

                <div className="flex flex-col items-start leading-[1.2]">
                  <span className={`text-[12px] font-extrabold ${
                    isActive ? "text-[#cf6e38]" : isCompleted ? "text-[#4c423d]" : "text-[#8f7f73]"
                  }`}>
                    {stage.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-[#8f7f73] font-semibold mt-0.5">
                      {stage.desc}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="flex flex-col gap-2">
        {!isCanceled && actions.map((action) => {
          const Icon = getActionIcon(action.label);
          const isPrimary = action.primary;
          
          const buttonClass = isPrimary
            ? "bg-[linear-gradient(135deg,#d86c3d_0%,#cb6134_52%,#b95028_100%)] border-0 text-white shadow-[0_4px_12px_rgba(207,110,56,0.24)] hover:shadow-[0_6px_16px_rgba(207,110,56,0.36)] hover:scale-[1.01] transition-all duration-150 active:scale-95"
            : "border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4] hover:border-[#cf6e38]/30 hover:text-[#cf6e38] transition active:scale-95";

          return (
            <button
              key={action.label}
              className={`flex w-full min-h-[34px] items-center justify-center gap-2 rounded-xl border text-[12px] font-extrabold cursor-pointer ${buttonClass}`}
              onClick={() => onActionClick?.(action)}
              type="button"
            >
              <Icon size={13} className={isPrimary ? "text-white" : "text-[#8f7f73]"} />
              <span>{action.label}</span>
            </button>
          );
        })}

        <button
          className="flex w-full min-h-[34px] items-center justify-center gap-2 rounded-xl border border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4] hover:border-[#cf6e38]/30 hover:text-[#cf6e38] transition cursor-pointer font-extrabold text-[12px] active:scale-95"
          onClick={onOrderAdjustmentClick}
          type="button"
        >
          <span>Order Adjustment</span>
        </button>

        {/* Manual dropdown overrides */}
        {onStatusSelect && (
          <div className="mt-4 pt-3.5 border-t border-[#e6ddd4] flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-1 text-[#8f7f73]">
              <Sliders size={11} />
              <label className="text-[10px] font-bold uppercase tracking-wider">
                Manual Status Override
              </label>
            </div>
            <div className="relative">
              <select
                className="w-full min-h-[34px] rounded-lg border border-[#d8cec4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2b231e] outline-none shadow-[0_1px_3px_rgba(38,23,14,0.02)] transition duration-150 focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] cursor-pointer"
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
