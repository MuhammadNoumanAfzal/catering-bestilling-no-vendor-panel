import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySchedulePicker from "./DeliverySchedulePicker";
import DeliverySectionCard from "./DeliverySectionCard";

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

  return (
    <DeliverySectionCard
      description="Choose the exact days and time slots customers can book for delivery."
      disabled={disabled}
      title="Delivery Schedule"
    >
      <div className="grid grid-cols-[minmax(0,172px)_minmax(0,1fr)] items-start gap-x-6 gap-y-3 max-[760px]:grid-cols-1">
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

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <button
                key={`${slot.day}-${slot.start}-${slot.end}`}
                className={`type-subpara rounded-[8px] border border-[#5f5853] bg-white px-4 py-[9px] text-[#2a221d] transition ${
                  disabled
                    ? "cursor-not-allowed bg-[#f6f3ef] text-[#8f8377]"
                    : "cursor-pointer hover:border-[#2a221d]"
                }`}
                disabled={disabled}
                onClick={() => onRemoveTimeSlot(slot)}
                type="button"
              >
                {dayLabels[slot.day] || slot.day.toUpperCase()} . {slot.label} &times;
              </button>
            ))}
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
        <p className="type-subpara mt-3 text-[#d25545]">{errors.deliveryTimeSlots}</p>
      ) : null}

      <DeliveryInfoNote>
        This section controls customer-facing delivery slot selection. It is separate from your general business hours.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
