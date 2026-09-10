import i18n from "../../../i18n";
import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextArea from "./DeliveryTextArea";
import DeliveryTextInput from "./DeliveryTextInput";
import { useTranslation } from "react-i18next";

export default function DeliveryPickupSection({
  pickupAddress,
  pickupInstructions,
  onPickupAddressChange,
  onPickupInstructionsChange,
  disabled = false,
  errors = {},
}) {
  const { t } = useTranslation();
  return (
    <DeliverySectionCard
      description={t("delivery.pickupDescription", { defaultValue: "Define where customers collect pickup orders and what they should know on arrival." })}
      disabled={disabled}
      title={t("delivery.pickupDetails", { defaultValue: "Pickup Details" })}
    >
      <div className="grid gap-3">
        <DeliveryTextInput
          disabled={disabled}
          error={errors.pickupAddress}
          label={t("delivery.pickupAddress", { defaultValue: "Pickup Address" })}
          onChange={onPickupAddressChange}
          placeholder={i18n.t("delivery.pickupAddressPlaceholder")}
          value={pickupAddress}
        />
        <DeliveryTextArea
          disabled={disabled}
          error={errors.pickupInstructions}
          label={`${t("delivery.pickupInstructions", { defaultValue: "Pickup Instructions" })} (${t("settings.optional", { defaultValue: "optional" })})`}
          onChange={onPickupInstructionsChange}
          placeholder={i18n.t("delivery.pickupInstructionsPlaceholder")}
          rows={4}
          value={pickupInstructions}
        />
      </div>
      <DeliveryInfoNote> {i18n.t("delivery.pickupRequired")} </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
