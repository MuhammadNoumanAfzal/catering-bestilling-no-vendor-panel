import i18n from "../../../i18n";
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
          <p className="type-subpara mt-1 text-[#a09084]"> {i18n.t("delivery.advanceNoticeHelp")} </p>
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
          <p className="type-subpara mt-1 text-[#a09084]"> {i18n.t("delivery.capacityHelp")} </p>
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
          <p className="type-subpara mt-1 text-[#a09084]"> {i18n.t("delivery.slotCapacityHelp")} </p>
        </div>
      </div>
      <DeliveryInfoNote> {i18n.t("delivery.limitsHelp")} </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
