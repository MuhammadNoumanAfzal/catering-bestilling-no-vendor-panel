import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliveryModeSelector from "./DeliveryModeSelector";
import DeliverySectionCard from "./DeliverySectionCard";

export default function DeliveryModeSection({
  modes,
  selectedModes,
  onToggleMode,
  errors = {},
}) {
  const modeError =
    errors.deliveryMode || errors.deliveryAvailable || errors.pickupAvailable;

  return (
    <DeliverySectionCard
      description="Choose whether you offer home delivery or store pickup only."
      title="Delivery Mode"
    >
      <DeliveryModeSelector
        modes={modes}
        onToggleMode={onToggleMode}
        selectedModes={selectedModes}
      />
      <DeliveryInfoNote>
        You can enable both delivery and pickup if you want to offer both
        options.
      </DeliveryInfoNote>
      {modeError ? (
        <p className="type-subpara mt-3 text-[#d25545]">{modeError}</p>
      ) : null}
    </DeliverySectionCard>
  );
}
