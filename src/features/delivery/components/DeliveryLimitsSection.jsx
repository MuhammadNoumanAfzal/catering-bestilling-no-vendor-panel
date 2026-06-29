import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextInput from "./DeliveryTextInput";

export default function DeliveryLimitsSection({
  minDeliveryTime,
  maxDeliveryTime,
  maxDeliveriesPerDay,
  maxOrdersPerTimeSlot,
  onMinDeliveryTimeChange,
  onMaxDeliveryTimeChange,
  onMaxDeliveriesPerDayChange,
  onMaxOrdersPerTimeSlotChange,
  disabled = false,
  errors = {},
}) {
  return (
    <DeliverySectionCard
      description="Set operational limits and expected delivery window timings."
      disabled={disabled}
      title="Limits & Delivery Window"
    >
      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.minDeliveryTime}
            label="Minimum Delivery Time (minutes)"
            onChange={onMinDeliveryTimeChange}
            placeholder="30"
            value={minDeliveryTime}
          />
          <p className="type-subpara mt-1 text-[#a09084]">
            Earliest estimated delivery time for customers.
          </p>
        </div>
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.maxDeliveryTime}
            label="Maximum Delivery Time (minutes)"
            onChange={onMaxDeliveryTimeChange}
            placeholder="120"
            value={maxDeliveryTime}
          />
          <p className="type-subpara mt-1 text-[#a09084]">
            Upper delivery estimate shown during busy periods.
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
        These limits help avoid overbooking and set realistic delivery expectations.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
