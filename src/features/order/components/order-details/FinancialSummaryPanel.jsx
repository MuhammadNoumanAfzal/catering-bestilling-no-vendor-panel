import { useTranslation } from "react-i18next";
import DetailPanel from "./DetailPanel";

function translateSummaryLabel(label, t) {
  const normalized = String(label || "").toLowerCase();
  if (normalized.startsWith("subtotal")) return label.replace(/^Subtotal/i, t("orders.detail.subtotal", { defaultValue: "Subtotal" })).replace(/guests/i, t("orders.guests", { defaultValue: "guests" }));
  const key = { "delivery fee": "deliveryFee", "sales tax": "salesTax", "add-ons": "addOns", tip: "tip", "service fee": "serviceFee", discount: "discount", "customer responsibility": "customerResponsibility", "company responsibility": "companyResponsibility", total: "total" }[normalized];
  return key ? t(`orders.detail.${key}`, { defaultValue: label }) : label;
}

export default function FinancialSummaryPanel({ summary }) {
  const { t } = useTranslation();
  return (
    <DetailPanel title={t("orders.detail.financialSummary", { defaultValue: "Financial Summary" })}>
      <div className="flex flex-col gap-[10px]">
        {summary.map((item, index) => (
          <div
            key={item.label}
            className={`flex items-start justify-between gap-3 text-[16px]  text-black  ${
              index === summary.length - 1
                ? "mt-0.5 border-t border-[#ebe2d9] pt-[10px] text-base text-[#17120e]"
                : ""
            }`}
          >
            <span>{translateSummaryLabel(item.label, t)}</span>
            <p>{item.value}</p>
          </div>
        ))}
      </div>
    </DetailPanel>
  );
}
