import { formatMoney } from "../../../utils/formatMoney.js";
import i18n from "../../../i18n";
import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryTextInput from "./DeliveryTextInput";
import { useTranslation } from "react-i18next";

function formatCurrencyValue(value) {
  if (value == null || String(value).trim() === "" || !Number.isFinite(Number(value)) || Number(value) < 0) return "";
  return formatMoney(value);
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
      ? t("delivery.feeBelowThreshold", { fee: formattedBaseFee, threshold: formattedFreeDelivery })
      : formattedBaseFee
        ? t("delivery.standardFee", { fee: formattedBaseFee })
        : formattedFreeDelivery
          ? t("delivery.freeFromThreshold", { threshold: formattedFreeDelivery })
          : i18n.t("delivery.feeHelp");

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
            placeholder="150"
            value={`${baseFee ?? ""}`.replace(/\.0+$/, "")}
          />
          <p className="type-subpara mt-1">{t("delivery.standardOrders", { defaultValue: "Applied to standard orders." })}</p>
        </div>
        <div>
          <DeliveryTextInput
            disabled={disabled}
            error={errors.freeDeliveryOver}
            label={`${t("delivery.freeDelivery", { defaultValue: "Free Delivery over" })} (${t("settings.optional", { defaultValue: "optional" })})`}
            onChange={onFreeDeliveryChange}
            placeholder="5000"
            value={`${freeDelivery ?? ""}`.replace(/\.0+$/, "")}
          />
        </div>
      </div>
      <DeliveryInfoNote>{pricingNote}</DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
