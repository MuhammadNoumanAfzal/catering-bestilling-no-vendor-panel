import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextInput from "./DeliveryTextInput";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      description={t("delivery.pricingDescription", { defaultValue: "Set your delivery fee and minimum order value." })}
      disabled={disabled}
      title={t("delivery.pricing", { defaultValue: "Pricing & Minimum Order" })}
    >
      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.baseDeliveryFee}
            label={t("delivery.baseFee", { defaultValue: "Base Delivery Fee" })}
            onChange={onBaseFeeChange}
            placeholder="150.00"
            value={baseFee}
          />
          <p className="type-subpara mt-1">{t("delivery.standardOrders", { defaultValue: "Applied to standard orders." })}</p>
        </div>
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.freeDeliveryOver}
            label={`${t("delivery.freeDelivery", { defaultValue: "Free Delivery over" })} (${t("settings.optional", { defaultValue: "optional" })})`}
            onChange={onFreeDeliveryChange}
            placeholder="5000.00"
            value={freeDelivery}
          />
          <p className="type-subpara mt-1">{t("delivery.largeOrderMode", { defaultValue: "Large order only mode" })}</p>
        </div>
      </div>
      <DeliveryInfoNote>{pricingNote}</DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
