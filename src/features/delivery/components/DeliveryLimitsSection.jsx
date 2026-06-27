import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextInput from "./DeliveryTextInput";

export default function DeliveryLimitsSection({
  maxDeliveriesPerDay,
  maxOrdersPerTimeSlot,
  onMaxDeliveriesPerDayChange,
  onMaxOrdersPerTimeSlotChange,
  disabled = false,
  errors = {},
}) {
  return (
    <DeliverySectionCard
      description="Set limits to manage your daily delivery capacity."
      disabled={disabled}
      title="Limits (Optional)"
    >
      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.maxDeliveriesPerDay}
            label="Max Deliveries Per Day"
            onChange={onMaxDeliveriesPerDayChange}
            placeholder="100"
            value={maxDeliveriesPerDay}
          />
          <p className="type-subpara mt-1 text-[#a09084]">
            Based on store size and driver count.
          </p>
        </div>
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.maxOrdersPerTimeSlot}
            label="Max Orders Per Time Slot"
            onChange={onMaxOrdersPerTimeSlotChange}
            placeholder="40"
            value={maxOrdersPerTimeSlot}
          />
          <p className="type-subpara mt-1 text-[#a09084]">
            Maximum customers in a single time slot.
          </p>
        </div>
      </div>
      <DeliveryInfoNote>
        These limits help avoid overbooking and manage operational workloads.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
