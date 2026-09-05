import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliveryModeSelector from "./DeliveryModeSelector";
import DeliverySectionCard from "./DeliverySectionCard";
import { useTranslation } from "react-i18next";

export default function DeliveryModeSection({
  modes,
  selectedModes,
  onToggleMode,
  disabled = false,
  errors = {},
}) {
  const { t } = useTranslation();
  const modeError =
    errors.deliveryMode || errors.deliveryAvailable || errors.pickupAvailable;

  return (
    <DeliverySectionCard
      description={t("delivery.modeDescription", { defaultValue: "Choose whether you offer home delivery or store pickup only." })}
      title={t("delivery.mode", { defaultValue: "Delivery Mode" })}
    >
      <DeliveryModeSelector
        disabled={disabled}
        modes={modes}
        onToggleMode={onToggleMode}
        selectedModes={selectedModes}
      />
      <DeliveryInfoNote>
        {t("delivery.bothModes", { defaultValue: "You can enable both delivery and pickup if you want to offer both options." })}
      </DeliveryInfoNote>
      {modeError ? (
        <p className="type-subpara mt-3 text-[#d25545]">{modeError}</p>
      ) : null}
    </DeliverySectionCard>
  );
}
