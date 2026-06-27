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
  return (
    <DeliverySectionCard
      description="Choose days and time slots when you deliver."
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
                key={slot}
                className={`type-subpara rounded-[8px] border border-[#5f5853] bg-white px-4 py-[9px] text-[#2a221d] transition ${
                  disabled
                    ? "cursor-not-allowed bg-[#f6f3ef] text-[#8f8377]"
                    : "cursor-pointer hover:border-[#2a221d]"
                }`}
                disabled={disabled}
                onClick={() => onRemoveTimeSlot(slot)}
                type="button"
              >
                {slot} &times;
              </button>
            ))}
          </div>

          <button
            className={`type-subpara w-fit rounded-[6px] border border-[#ddd6ce] bg-white px-4 py-[8px] text-[#9d9187] transition ${
              disabled
                ? "cursor-not-allowed bg-[#f6f3ef] text-[#b0a49a]"
                : "cursor-pointer hover:border-[#c9bfb7] hover:text-[#7c7067]"
            }`}
            disabled={disabled}
            onClick={onAddCustomSlot}
            type="button"
          >
            + Add custom slot
          </button>
        </div>
      </div>
      {errors.deliveryTimeSlots ? (
        <p className="type-subpara mt-3 text-[#d25545]">{errors.deliveryTimeSlots}</p>
      ) : null}

      <DeliveryInfoNote>
        Orders will be accepted only in the time slots you define.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
