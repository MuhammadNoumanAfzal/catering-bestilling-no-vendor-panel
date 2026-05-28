import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTagList from "./DeliveryTagList";
import DeliveryTextInput from "./DeliveryTextInput";

export default function DeliveryPostalCodesSection({
  postalCode,
  filteredPostalCodes,
  onPostalCodeChange,
  onRemovePostalCode,
  disabled = false,
}) {
  return (
    <DeliverySectionCard
      description="Add postal codes of delivery areas."
      disabled={disabled}
      title="Delivery"
    >
      <DeliveryTextInput
        disabled={disabled}
        label="Search Postal code"
        onChange={onPostalCodeChange}
        placeholder="Search..."
        value={postalCode}
      />
      <DeliveryTagList
        disabled={disabled}
        items={filteredPostalCodes}
        onRemove={onRemovePostalCode}
      />
    </DeliverySectionCard>
  );
}
