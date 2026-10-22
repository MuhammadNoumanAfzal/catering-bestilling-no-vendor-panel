import { 
  CookingPot, 
  PackageCheck, 
  Truck, 
  BadgeCheck, 
  Play, 
  Sliders, 
  AlertTriangle 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DetailPanel from "./DetailPanel";



function getStageIndex(status) {
  if (!status) return -1;
  const norm = status.toLowerCase().replace(/[_-]+/g, " ").trim();
  if (norm === "new" || norm === "placed" || norm === "pending") return 0;
  if (norm === "accepted" || norm === "confirmed") return 1;
  if (
    norm === "preparing" ||
    norm === "in preparation" ||
    norm === "processing"
  ) {
    return 2;
  }
  if (
    norm === "ready" ||
    norm === "food ready" ||
    norm === "ready to deliver" ||
    norm === "ready to dispatch"
  ) {
    return 3;
  }
  if (
    norm === "out for delivery" ||
    norm === "in transit" ||
    norm === "out_for_delivery"
  ) {
    return 4;
  }
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
  const { t } = useTranslation();
  const isCanceled = currentStatus === "Canceled" || currentStatus === "Reject";
  const canAdjustOrder = !isCanceled && getStageIndex(currentStatus) < getStageIndex("Delivered");

  return (
    <DetailPanel title={t("orders.detail.orderLifecycle", { defaultValue: "Order Lifecycle" })}>
      {/* Canceled/Aborted Status View */}
      {isCanceled ? (
        <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#ffd0cc] bg-[#fff2f1] p-4 text-center">
          <AlertTriangle className="text-[#dc2626]" size={32} />
          <strong className="text-[15px] font-extrabold text-[#dc2626]">{t("orders.detail.orderCanceled", { defaultValue: "Order Canceled" })}</strong>
          <p className="m-0 text-[11px] font-semibold text-[#8a7a6d]">
            {t("orders.detail.orderCanceledHelp", { defaultValue: "This order has been rejected or canceled." })}
          </p>
        </div>
      ) : null}

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
              <span>{t(`orders.actionLabels.${action.label}`, { defaultValue: action.label })}</span>
            </button>
          );
        })}

        {canAdjustOrder ? (
          <button
            className="flex w-full min-h-[34px] items-center justify-center gap-2 rounded-xl border border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4] hover:border-[#cf6e38]/30 hover:text-[#cf6e38] transition cursor-pointer font-extrabold text-[12px] active:scale-95"
            onClick={onOrderAdjustmentClick}
            type="button"
          >
            <span>{t("orders.detail.orderAdjustment", { defaultValue: "Order Adjustment" })}</span>
          </button>
        ) : null}

        {/* Manual dropdown overrides */}
        {onStatusSelect && (
          <div className="mt-4 pt-3.5 border-t border-[#e6ddd4] flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-1 text-[#8f7f73]">
              <Sliders size={11} />
              <label className="text-[10px] font-bold uppercase tracking-wider">
                {t("orders.detail.manualStatusOverride", { defaultValue: "Manual Status Override" })}
              </label>
            </div>
            <div className="relative">
              <select
                className="w-full min-h-[34px] rounded-lg border border-[#d8cec4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2b231e] outline-none shadow-[0_1px_3px_rgba(38,23,14,0.02)] transition duration-150 focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] cursor-pointer"
                value={currentStatus || ""}
                onChange={(e) => onStatusSelect(e.target.value)}
              >
                <option value="Accepted">{t("orders.accepted", { defaultValue: "Accepted" })}</option>
                <option value="Preparing">{t("orders.preparing", { defaultValue: "Preparing" })}</option>
                <option value="Ready">{t("orders.ready", { defaultValue: "Ready" })}</option>
                <option value="Out for delivery">{t("orders.outForDelivery", { defaultValue: "Out for Delivery" })}</option>
                <option value="Delivered">{t("orders.delivered", { defaultValue: "Delivered" })}</option>
                <option value="Canceled">{t("orders.detail.canceledReject", { defaultValue: "Canceled (Reject)" })}</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </DetailPanel>
  );
}
