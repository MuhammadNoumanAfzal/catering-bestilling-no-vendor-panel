import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySchedulePicker from "./DeliverySchedulePicker";
import DeliverySectionCard from "./DeliverySectionCard";
import { AlertCircle, Clock3, X } from "lucide-react";

function isValidQuarterHourTime(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours >= 0 && hours <= 23 && [0, 15, 30, 45].includes(minutes);
}

export default function DeliveryScheduleSection({
  activeDays,
  days,
  onToggleDay,
  timeSlots,
  onRemoveTimeSlot,
  onAddCustomSlot,
  disabled = false,
  errors = {},
}) {
  const dayLabels = days.reduce((accumulator, day) => ({
    ...accumulator,
    [typeof day === "string" ? day : day.value]: typeof day === "string" ? day : day.label,
  }), {});
  const hasActiveDays = activeDays.length > 0;
  const hasSlotError = Boolean(errors.deliveryTimeSlots);

  return (
    <DeliverySectionCard
      description="Choose the exact days and time slots customers can book for delivery."
      disabled={disabled}
      title="Delivery Schedule"
    >
      <div className="grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] items-start gap-x-6 gap-y-4 max-[760px]:grid-cols-1">
        <div>
          <p className="type-para mb-3 mt-0 text-[#2a221d]">Delivery on</p>
          <DeliverySchedulePicker
            activeDays={activeDays}
            days={days}
            disabled={disabled}
            onToggleDay={onToggleDay}
          />
          {errors.deliveryDays ? (
            <p className="type-subpara mt-2 text-[#d25545]">{errors.deliveryDays}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div
            className={`rounded-[14px] border p-3 transition ${
              hasSlotError
                ? "border-[#f2b5ad] bg-[#fff6f4]"
                : "border-[#ece3db] bg-[#fcfbfa]"
            }`}
          >
            {timeSlots.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {timeSlots.map((slot) => {
                  const isInvalidSlot =
                    !isValidQuarterHourTime(slot.start) || !isValidQuarterHourTime(slot.end);

                  return (
                    <button
                      key={`${slot.day}-${slot.start}-${slot.end}`}
                      className={`group flex min-h-[64px] items-start justify-between gap-3 rounded-[12px] border px-3 py-3 text-left transition ${
                        isInvalidSlot
                          ? "border-[#f0b2a4] bg-[#fff4ef] text-[#8e3d24]"
                          : "border-[#ddd4cc] bg-white text-[#2a221d] hover:border-[#cf6e38] hover:shadow-[0_6px_18px_rgba(42,27,18,0.07)]"
                      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      disabled={disabled}
                      onClick={() => onRemoveTimeSlot(slot)}
                      type="button"
                    >
                      <span className="flex min-w-0 flex-1 items-start gap-2.5">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isInvalidSlot ? "bg-[#fde2d9] text-[#cf5f38]" : "bg-[#fff1ea] text-[#cf6e38]"
                          }`}
                        >
                          <Clock3 size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-extrabold">
                            {dayLabels[slot.day] || slot.day.toUpperCase()}
                          </span>
                          <span className="mt-1 block text-[12px] font-semibold text-[#6b5f56]">
                            {slot.label}
                          </span>
                          {isInvalidSlot ? (
                            <span className="mt-1 block text-[11px] font-bold text-[#cf5f38]">
                              Legacy time format. Remove and re-add this slot.
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                          isInvalidSlot
                            ? "border-[#f3c7bb] bg-white text-[#cf5f38]"
                            : "border-[#e7ded6] bg-white text-[#7d7067] group-hover:border-[#cf6e38] group-hover:text-[#cf6e38]"
                        }`}
                      >
                        <X size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[12px] border border-dashed border-[#ddd4cc] bg-white px-4 py-5 text-center">
                <p className="m-0 text-[13px] font-semibold text-[#7a6d63]">
                  No delivery slots added yet.
                </p>
                <p className="mt-1 text-[12px] text-[#9a8b7f]">
                  Add at least one slot so customers can choose delivery times.
                </p>
              </div>
            )}
          </div>

          <button
            className={`type-subpara w-fit rounded-[6px] border border-[#ddd6ce] bg-white px-4 py-[8px] text-[#9d9187] transition ${
              disabled || !hasActiveDays
                ? "cursor-not-allowed bg-[#f6f3ef] text-[#b0a49a]"
                : "cursor-pointer hover:border-[#c9bfb7] hover:text-[#7c7067]"
            }`}
            disabled={disabled || !hasActiveDays}
            onClick={onAddCustomSlot}
            type="button"
          >
            + Add custom slot
          </button>
          {!hasActiveDays ? (
            <p className="type-subpara m-0 text-[#8c5a48]">
              Select at least one delivery day before adding a slot.
            </p>
          ) : null}
        </div>
      </div>
      {errors.deliveryTimeSlots ? (
        <div className="mt-3 flex items-start gap-2 rounded-[10px] border border-[#f1beb7] bg-[#fff5f3] px-3 py-2.5 text-[#b44938]">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <p className="m-0 text-[12px] font-semibold leading-[1.5]">{errors.deliveryTimeSlots}</p>
        </div>
      ) : null}

      <DeliveryInfoNote>
        This section controls customer-facing delivery slot selection. It is separate from your general business hours.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
