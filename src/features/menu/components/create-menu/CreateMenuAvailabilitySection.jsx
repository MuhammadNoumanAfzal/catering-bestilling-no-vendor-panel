import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label } from "./CreateMenuFields";
import { useTranslation } from "react-i18next";

export default function CreateMenuAvailabilitySection({
  disabled = false,
  dietaryOptions,
  selectedDietary,
  toggleDietary,
}) {
  const { t } = useTranslation();
  return (
    <CreateMenuSectionCard
      description={t("menu.dietaryDescription", { defaultValue: "Help customers identify menu options that suit their needs." })}
      title={t("menu.dietaryTags", { defaultValue: "Dietary Tags" })}
    >
      <div>
        <Label>{t("menu.dietaryTags", { defaultValue: "Dietary Tags" })}</Label>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((tag) => {
            const tagValue = tag.value || tag;
            const tagLabel = tag.label || tag;
            const isActive = selectedDietary.includes(tagValue);

            return (
              <button
                key={tagValue}
                className={`cursor-pointer rounded-full border px-3 py-[8px] text-[13px] font-semibold transition ${
                  isActive
                    ? "border-[#cf6e38] bg-[#fff0e9] text-[#cf6e38]"
                    : "border-[#bdb2a9] bg-white text-[#29211d]"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                disabled={disabled}
                onClick={() => toggleDietary(tagValue)}
                type="button"
              >
                {tagLabel}
              </button>
            );
          })}
        </div>
      </div>
    </CreateMenuSectionCard>
  );
}
