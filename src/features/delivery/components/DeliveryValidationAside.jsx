import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";

export default function DeliveryValidationAside({
  pickupOnly = false,
  isValidating = false,
  validation = null,
  fieldErrors = {},
}) {
  const { t } = useTranslation();
  const issues = validation?.issues || [];
  const fieldErrorMessages = Object.values(fieldErrors).filter(Boolean);
  const messages = [...new Set([...issues, ...fieldErrorMessages].map((message) => {
    const normalized = String(message).trim();
    return /^pickup address is required (?:when|whenever) pickup is enabled\.?$/i.test(normalized)
      ? t("delivery.pickupRequired")
      : normalized;
  }).filter(Boolean))];
  const isValid = validation?.isValid ?? true;
  const hasProblems = issues.length > 0 || fieldErrorMessages.length > 0 || !isValid;

  return (
    <aside className="h-fit rounded-[12px] bg-[#ffb596] px-4 py-4">
      <h2 className="type-h5 m-0 text-[#2a1811]">{t("delivery.status", { defaultValue: "Delivery Status" })}</h2>
      <p className="type-para mt-2 leading-[1.45] text-[#593326]">
        {isValidating
          ? t("delivery.checking", { defaultValue: "Checking your delivery settings…" })
          : pickupOnly
            ? i18n.t("delivery.pickupOnlyHelp")
            : !hasProblems
              ? t("delivery.ready", { defaultValue: "Your delivery settings look good and are ready to save." })
              : t("delivery.fix", { defaultValue: "Please fix the items below before saving your delivery settings." })}
      </p>
      {messages.length ? (
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[13px] font-medium leading-[1.45] text-[#593326]">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
