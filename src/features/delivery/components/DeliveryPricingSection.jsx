import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextInput from "./DeliveryTextInput";

function formatCurrencyValue(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const digitsOnly = trimmedValue.replace(/[^0-9]/g, "");

  if (!digitsOnly) {
    return trimmedValue;
  }

  return `kr ${Number(digitsOnly).toLocaleString("en-US")}`;
}

export default function DeliveryPricingSection({
  baseFee,
  freeDelivery,
  onBaseFeeChange,
  onFreeDeliveryChange,
  disabled = false,
  errors = {},
}) {
  const formattedBaseFee = formatCurrencyValue(baseFee);
  const formattedFreeDelivery = formatCurrencyValue(freeDelivery);
  const pricingNote =
    formattedBaseFee && formattedFreeDelivery
      ? `Customer will pay ${formattedBaseFee} delivery fee on orders under ${formattedFreeDelivery}.`
      : formattedBaseFee
        ? `Customer will pay ${formattedBaseFee} delivery fee on standard orders.`
        : formattedFreeDelivery
          ? `Free delivery applies to orders from ${formattedFreeDelivery}.`
          : "Set a delivery fee and optional free delivery threshold.";

  return (
    <DeliverySectionCard
      description="Set your delivery fee and minimum order value."
      disabled={disabled}
      title="Pricing & Minimum Order"
    >
      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.baseDeliveryFee}
            label="Base Delivery Fee"
            onChange={onBaseFeeChange}
            placeholder="150.00"
            value={baseFee}
          />
          <p className="type-subpara mt-1">Applied to standard orders.</p>
        </div>
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.freeDeliveryOver}
            label="Free Delivery over (optional)"
            onChange={onFreeDeliveryChange}
            placeholder="5000.00"
            value={freeDelivery}
          />
          <p className="type-subpara mt-1">Large order only mode</p>
        </div>
      </div>
      <DeliveryInfoNote>{pricingNote}</DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
