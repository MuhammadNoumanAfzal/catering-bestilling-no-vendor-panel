import "./deliverySchedule.css";
import { useState } from "react";
import i18n from "../../../i18n";
import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySchedulePicker from "./DeliverySchedulePicker";
import DeliverySectionCard from "./DeliverySectionCard";
import { AlertCircle, Clock3, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

function isValidQuarterHourTime(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && [0, 15, 30, 45].includes(minutes);
}

export default function DeliveryScheduleSection({
  activeDays,
  days,
  onToggleAllDays,
  onToggleDay,
  timeSlots,
  onRemoveTimeSlot,
  onEditTimeSlot,
  onAddCustomSlot,
  onAddSlotForAllDays,
  disabled = false,
  errors = {},
}) {
  const { t } = useTranslation();
  const [focusedDay, setFocusedDay] = useState("");
  const selectedDay = focusedDay || activeDays[0] || (typeof days[0] === "string" ? days[0] : days[0]?.value);
  const dayLabels = days.reduce((accumulator, day) => ({ ...accumulator, [typeof day === "string" ? day : day.value]: typeof day === "string" ? day : day.label }), {});
  const hasActiveDays = activeDays.length > 0;
  const hasSlotError = Boolean(errors.deliveryTimeSlots);
  const orderedTimeSlots = timeSlots.filter(slot => slot.day === selectedDay).sort((a,b) => a.start.localeCompare(b.start));

  return (
    <DeliverySectionCard description={t("delivery.scheduleDescription", { defaultValue: "Choose the exact days and time slots customers can book for delivery." })} disabled={disabled} title={t("delivery.schedule", { defaultValue: "Delivery Schedule" })}>
      <div className="vendor-schedule-layout">
        <div>
          <DeliverySchedulePicker activeDays={activeDays} days={days} disabled={disabled} onToggleAllDays={onToggleAllDays} onToggleDay={onToggleDay} />
          {errors.deliveryDays ? <p className="type-subpara mt-2 text-[#d25545]">{errors.deliveryDays}</p> : null}
        </div>

        <div className="vendor-schedule-panel">
          <div className="vendor-schedule-tabs" role="group" aria-label={t("delivery.schedule", {defaultValue:"Delivery Schedule"})}>
            {days.map(day => { const value = typeof day === "string" ? day : day.value; return <button type="button" key={value} aria-pressed={selectedDay === value} onClick={() => setFocusedDay(value)} className={"rounded-lg border px-3 py-2 text-[12px] font-semibold transition " + (selectedDay === value ? "border-[#cf6e38] bg-[#cf6e38] text-white" : "border-[#e7ded6] bg-white text-[#6b5f56] hover:border-[#cf6e38]")}>{t(`delivery.${value}`, {defaultValue:dayLabels[value]})}<span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black/5 px-1.5 py-0.5 text-[10px]">{timeSlots.filter(slot=>slot.day===value).length}</span></button>; })}
          </div>
          <div className={hasSlotError ? "vendor-schedule-slots vendor-schedule-error" : "vendor-schedule-slots"}>
            {orderedTimeSlots.length ? (
              <div key={selectedDay} tabIndex={0} role="region" aria-label={t(`delivery.${selectedDay}`, {defaultValue:dayLabels[selectedDay]})} className="hide-scrollbar vendor-schedule-grid">
                {orderedTimeSlots.map((slot) => {
                  const isInvalidSlot = !isValidQuarterHourTime(slot.start) || !isValidQuarterHourTime(slot.end);
                  return (
                    <div key={`${slot.day}-${slot.start}-${slot.end}`} className={`vendor-schedule-slot group flex items-start justify-between gap-2 rounded-[10px] border px-2.5 py-2.5 transition ${isInvalidSlot ? "border-[#f0b2a4] bg-[#fff4ef] text-[#8e3d24]" : "border-[#ddd4cc] bg-white text-[#2a221d] hover:border-[#cf6e38] hover:shadow-[0_6px_18px_rgba(42,27,18,0.07)]"} ${disabled ? "opacity-70" : ""}`}>
                      <span className="flex min-w-0 flex-1 items-start gap-1.5">
                        <Clock3 size={16} className="mt-0.5 shrink-0 text-[#e57740]"/><span className="min-w-0">
                          <strong className="block text-[11px] font-semibold text-[#65574c]">{t(`delivery.${slot.day}`, {defaultValue:dayLabels[slot.day]})}</strong>
                          <span className="mt-1 block whitespace-nowrap text-[10px] font-medium tabular-nums text-[#88786a]">{slot.start}<span className="mx-1 text-[#b7a799]">–</span>{slot.end}</span>
                          {isInvalidSlot ? <span className="mt-1 block text-[11px] font-bold text-[#cf5f38]">{i18n.t("delivery.legacySlot")}</span> : null}
                        </span>
                      </span>
                      <span className="flex shrink-0 gap-1">
                        <button aria-label={t("delivery.editSlot", { defaultValue: "Edit slot" })} className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#e7ded6] bg-white text-[#7d7067] transition hover:border-[#cf6e38] hover:text-[#cf6e38] disabled:cursor-not-allowed disabled:opacity-60" disabled={disabled} onClick={() => onEditTimeSlot(slot)} type="button"><Pencil size={13} /></button>
                        <button aria-label={t("delivery.removeSlot", { defaultValue: "Remove slot" })} className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#e7ded6] bg-white text-[#7d7067] transition hover:border-[#d25545] hover:text-[#d25545] disabled:cursor-not-allowed disabled:opacity-60" disabled={disabled} onClick={() => onRemoveTimeSlot(slot)} type="button"><Trash2 size={13} /></button>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[12px] border border-dashed border-[#ddd4cc] bg-white px-4 py-5 text-center">
                <p className="m-0 text-[13px] font-semibold text-[#7a6d63]">{t("delivery.noSlotsForDay", { defaultValue: "No delivery slots for this day." })}</p>
                <p className="mt-1 text-[12px] text-[#9a8b7f]">{i18n.t("delivery.addSlotHelp")}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button className={`type-subpara w-fit rounded-[6px] border border-[#ddd6ce] bg-white px-4 py-[8px] text-[#9d9187] transition ${disabled || !hasActiveDays ? "cursor-not-allowed bg-[#f6f3ef] text-[#b0a49a]" : "cursor-pointer hover:border-[#c9bfb7] hover:text-[#7c7067]"}`} disabled={disabled || !hasActiveDays} onClick={onAddCustomSlot} type="button">+ {t("delivery.addSlotByDay", { defaultValue: "Add slot by day" })}</button>
            <button className="type-subpara w-fit rounded-[6px] border border-[#cf6e38] bg-[#fff8f4] px-4 py-[8px] text-[#b9562e] transition hover:bg-[#fff1ea] disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} onClick={onAddSlotForAllDays} type="button">+ {t("delivery.addSlotAllDays", { defaultValue: "Add slot for all days" })}</button>
          </div>
          {!hasActiveDays ? <p className="type-subpara m-0 text-[#8c5a48]">{i18n.t("delivery.selectDayHelp")}</p> : null}
        </div>
      </div>
      {errors.deliveryTimeSlots ? <div className="mt-3 flex items-start gap-2 rounded-[10px] border border-[#f1beb7] bg-[#fff5f3] px-3 py-2.5 text-[#b44938]"><AlertCircle className="mt-0.5 shrink-0" size={16} /><p className="m-0 text-[12px] font-semibold leading-[1.5]">{errors.deliveryTimeSlots}</p></div> : null}
      <DeliveryInfoNote>{i18n.t("delivery.scheduleHelp")}</DeliveryInfoNote>
    </DeliverySectionCard>
  );
}