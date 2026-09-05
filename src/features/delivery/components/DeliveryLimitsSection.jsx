import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextInput from "./DeliveryTextInput";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <DeliverySectionCard
      description={t("delivery.limitsDescription", { defaultValue: "Set order notice requirements and capacity limits." })}
      disabled={disabled}
      title={t("delivery.limits", { defaultValue: "Limits" })}
    >
      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.minimumOrderNoticeHours}
            label={t("delivery.minimumNotice", { defaultValue: "Minimum Order Notice (hours)" })}
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
            label={t("delivery.maxDeliveries", { defaultValue: "Max Deliveries Per Day" })}
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
            label={t("delivery.maxOrders", { defaultValue: "Max Orders Per Time Slot" })}
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
