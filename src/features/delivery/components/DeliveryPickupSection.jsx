import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextArea from "./DeliveryTextArea";
import DeliveryTextInput from "./DeliveryTextInput";

export default function DeliveryPickupSection({
  pickupAddress,
  pickupInstructions,
  onPickupAddressChange,
  onPickupInstructionsChange,
  disabled = false,
  errors = {},
}) {
  return (
    <DeliverySectionCard
      description="Define where customers collect pickup orders and what they should know on arrival."
      disabled={disabled}
      title="Pickup Details"
    >
      <div className="grid gap-3">
        <DeliveryTextInput
          disabled={disabled}
          error={errors.pickupAddress}
          label="Pickup Address"
          onChange={onPickupAddressChange}
          placeholder="Enter the pickup address"
          value={pickupAddress}
        />
        <DeliveryTextArea
          disabled={disabled}
          error={errors.pickupInstructions}
          label="Pickup Instructions (optional)"
          onChange={onPickupInstructionsChange}
          placeholder="Share any directions, parking notes, or counter details"
          rows={4}
          value={pickupInstructions}
        />
      </div>
      <DeliveryInfoNote>
        Pickup address is required whenever pickup is enabled.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
