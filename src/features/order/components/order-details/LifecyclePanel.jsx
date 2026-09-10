import { 
  Check, 
  X, 
  AlertCircle, 
  HelpCircle,
  Play
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DetailPanel from "./DetailPanel";

const STAGES = [
  { id: "New", labelKey: "orders.detail.stageNew", defaultLabel: "New Order", descKey: "orders.detail.stageIncoming", defaultDesc: "Incoming request" },
  { id: "Accepted", labelKey: "orders.detail.stageConfirmed", defaultLabel: "Confirmed", descKey: "orders.detail.stageScheduled", defaultDesc: "Scheduled for production" },
  { id: "Preparing", labelKey: "orders.preparing", defaultLabel: "Preparing", descKey: "orders.detail.stageKitchen", defaultDesc: "Kitchen staff working" },
  { id: "Ready", labelKey: "orders.detail.stageFoodReady", defaultLabel: "Food Ready", descKey: "orders.detail.stagePacked", defaultDesc: "Packed & awaiting dispatch" },
  { id: "Out for delivery", labelKey: "orders.detail.stageTransit", defaultLabel: "In Transit", descKey: "orders.detail.stageDriver", defaultDesc: "Driver on the way" },
  { id: "Delivered", labelKey: "orders.delivered", defaultLabel: "Delivered", descKey: "orders.detail.stageArrived", defaultDesc: "Arrived at customer" },
];

export default function LifecyclePanel({ 
  actions, 
  onActionClick, 
  onOrderAdjustmentClick 
}) {
  const { t } = useTranslation();
  return (
    <DetailPanel title={t("orders.detail.orderLifecycle", { defaultValue: "Order Lifecycle" })}>
      {/* Onboarding Incoming Alert Box */}
      <div className="mb-4 flex flex-col gap-2 rounded-xl border border-[#bde3f9] bg-[#e3f4ff] p-3 text-left">
        <div className="flex items-center gap-2 text-[#1d70a2]">
          <AlertCircle size={16} strokeWidth={2.5} className="animate-pulse" />
          <strong className="text-[12px] font-extrabold uppercase tracking-wider">
            {t("orders.detail.reviewRequested", { defaultValue: "Review Requested" })}
          </strong>
        </div>
        <p className="m-0 text-[11px] font-semibold leading-[1.45] text-[#5e6d7a]">
          {t("orders.detail.reviewRequestedHelp", { defaultValue: "Please review the order details and choose whether to accept the scheduled delivery date." })}
        </p>
      </div>

      {/* Stepper with Step 1 highlighted */}
      <div className="relative mb-5 flex flex-col gap-4 pl-3.5 mt-2">
        <div className="absolute left-[20px] top-[8px] bottom-[8px] w-0.5 bg-[#e6ddd4]" aria-hidden="true" />

        {STAGES.map((stage, idx) => {
          const isActive = idx === 0;

          let dotWidget = null;
          if (isActive) {
            dotWidget = (
              <span className="relative flex h-[15px] w-[15px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1d70a2] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-[15px] w-[15px] bg-[#1d70a2]"></span>
              </span>
            );
          } else {
            dotWidget = <span className="h-2.5 w-2.5 rounded-full bg-[#d8cec4] border border-[#c7bbb0]" />;
          }

          return (
            <div key={stage.id} className="relative flex items-center gap-3.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center z-[1] bg-white">
                {dotWidget}
              </div>

              <div className="flex flex-col items-start leading-[1.2]">
                <span className={`text-[12px] font-extrabold ${
                  isActive ? "text-[#1d70a2]" : "text-[#8f7f73]"
                }`}>
                  {t(stage.labelKey, { defaultValue: stage.defaultLabel })}
                </span>
                {isActive && (
                  <span className="text-[10px] text-[#8f7f73] font-semibold mt-0.5">
                    {t(stage.descKey, { defaultValue: stage.defaultDesc })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          const isAccept = /accept/i.test(action.label);
          const isReject = /reject/i.test(action.label);
          
          let buttonClass = "";
          let Icon = Play;

          if (isAccept) {
            Icon = Check;
            buttonClass = "border-[#2ca24f] bg-[#2ca24f] text-white hover:bg-[#21873f] shadow-[0_4px_12px_rgba(44,162,79,0.22)] transition active:scale-95";
          } else if (isReject) {
            Icon = X;
            buttonClass = "border-[#e4d9cf] bg-white text-[#dc2626] hover:bg-[#fff2f1] hover:border-[#ffd0cc] transition active:scale-95";
          } else {
            buttonClass = "border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4] transition active:scale-95";
          }

          return (
            <button
              key={action.label}
              className={`flex w-full min-h-[34px] items-center justify-center gap-2 rounded-xl border text-[12px] font-extrabold cursor-pointer ${buttonClass}`}
              onClick={() => onActionClick?.(action)}
              type="button"
            >
              <Icon size={13} strokeWidth={isAccept || isReject ? 3 : 2} />
              <span>{t(`orders.actionLabels.${action.label}`, { defaultValue: action.label })}</span>
            </button>
          );
        })}

        {typeof onOrderAdjustmentClick === "function" ? (
          <button
            className="flex w-full min-h-[34px] items-center justify-center gap-2 rounded-xl border border-[#d8cec4] bg-white text-[#2b231e] hover:bg-[#faf7f4] hover:border-[#cf6e38]/30 hover:text-[#cf6e38] transition cursor-pointer font-extrabold text-[12px] active:scale-95"
            onClick={onOrderAdjustmentClick}
            type="button"
          >
            <span>{t("orders.detail.orderAdjustment", { defaultValue: "Order Adjustment" })}</span>
          </button>
        ) : null}
      </div>
    </DetailPanel>
  );
}
