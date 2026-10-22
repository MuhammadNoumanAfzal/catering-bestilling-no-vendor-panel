import { 
  Check, 
  X, 
  AlertCircle, 
  Play
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DetailPanel from "./DetailPanel";



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
