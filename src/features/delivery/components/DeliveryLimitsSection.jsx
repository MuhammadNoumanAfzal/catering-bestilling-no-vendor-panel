import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextInput from "./DeliveryTextInput";

export default function DeliveryLimitsSection({
  maxDeliveriesPerDay,
  maxOrdersPerTimeSlot,
  minimumOrderNoticeHours,
  onMaxDeliveriesPerDayChange,
  onMaxOrdersPerTimeSlotChange,
  onMinimumOrderNoticeHoursChange,
  disabled = false,
  errors = {},
}) {
  return (
    <DeliverySectionCard
      description="Set order notice requirements and capacity limits. These values do not define customer bookable slots."
      disabled={disabled}
      title="Limits"
    >
      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.minimumOrderNoticeHours}
            label="Minimum Order Notice (hours)"
            onChange={onMinimumOrderNoticeHoursChange}
            placeholder="24"
            value={minimumOrderNoticeHours}
          />
          <p className="type-subpara mt-1 text-[#a09084]">
            Customers must book at least this many hours in advance.
          </p>
        </div>
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
        Use Delivery Schedule above to control selectable delivery days and time slots. Use these limits for estimates and capacity only.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
