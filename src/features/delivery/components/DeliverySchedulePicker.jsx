import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DeliverySchedulePicker({
  days,
  activeDays,
  onToggleDay,
  disabled = false,
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-2">
      {days.map((day) => {
        const dayValue = typeof day === "string" ? day : day.value;
        const dayLabel = typeof day === "string" ? day : day.label;
        const isActive = activeDays.includes(dayValue);

        return (
          <button
            key={dayValue}
            className={`flex min-h-[46px] items-center justify-between rounded-[14px] border px-3.5 py-2 text-left transition duration-150 ${
              isActive
                ? "border-[#ef8b5d] bg-[linear-gradient(180deg,#fff6f1_0%,#fff0e7_100%)] text-[#d16d3a] shadow-[0_8px_18px_rgba(239,139,93,0.12)]"
                : "border-[#d8cec4] bg-white text-[#5d5650] hover:border-[#cf6e38]/40 hover:bg-[#fcfaf8]"
            } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            disabled={disabled}
            onClick={() => onToggleDay(dayValue)}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  isActive
                    ? "border-[#ef8b5d] bg-[#ef8b5d] text-white"
                    : "border-[#d9cec4] bg-[#f7f3ef] text-transparent"
                }`}
              >
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="text-[13px] font-bold">{t(`delivery.${dayValue}`, { defaultValue: dayLabel })}</span>
            </span>
            <span
              className={`text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                isActive ? "text-[#cf6e38]" : "text-[#a5968b]"
              }`}
            >
              {isActive ? t("delivery.on", { defaultValue: "On" }) : t("delivery.off", { defaultValue: "Off" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
