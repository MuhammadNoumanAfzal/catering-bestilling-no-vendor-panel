import { useTranslation } from "react-i18next";
import { isCustomerPaymentCleared } from "../utils/paymentStatus.js";
export default function OrderPaymentBadge({ order }) {
  const { t } = useTranslation();
  if (!isCustomerPaymentCleared(order)) return null;
  return <span className="inline-flex min-h-6 items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-800">{t("orders.paymentCleared", { defaultValue: "Paid" })}</span>;
}
