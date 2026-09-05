import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import SettingsSectionCard from "./SettingsSectionCard";

export default function LanguageSettingsCard() {
  const { i18n, t } = useTranslation();

  return (
    <SettingsSectionCard
      description={t("settings.languageDescription")}
      title={t("settings.languageTitle")}
    >
      <div className="flex items-center gap-3 rounded-[10px] border border-[#f0dfd3] bg-[#fffaf4] p-3">
        <Languages aria-hidden="true" className="shrink-0 text-[#cf6e38]" size={22} />
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[13px] font-bold text-[#201914]">{t("settings.displayLanguage")}</span>
          <select
            className="h-[38px] cursor-pointer rounded-[7px] border border-[#cec5bd] bg-white px-3 text-[13px] text-[#201712] outline-none focus:border-[#cf6e38]"
            onChange={(event) => i18n.changeLanguage(event.target.value)}
            value={i18n.language}
          >
            <option value="nb">{t("settings.norwegian")}</option>
            <option value="en">{t("settings.english")}</option>
          </select>
        </label>
      </div>
      <p className="mt-2 text-[12px] text-[#7a6d63]">{t("settings.languageNote")}</p>
    </SettingsSectionCard>
  );
}
