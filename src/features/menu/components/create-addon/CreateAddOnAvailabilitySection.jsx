import { Leaf, Eye } from "lucide-react";
import { Label } from "../create-menu/CreateMenuFields";
import { useTranslation } from "react-i18next";

export default function CreateAddOnAvailabilitySection({
  availableImmediately,
  disabled = false,
  dietaryOptions,
  onAvailabilityToggle,
  selectedDietary,
}) {
  const { t } = useTranslation();
  return (
    <section className="py-6">
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-[#202a34]"><Leaf size={18} className="text-[#7b8793]" />{t("menu.availabilityTags", { defaultValue: "Availability & Tags" })}</h2>
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Label>{t("menu.dietaryTags", { defaultValue: "Dietary Tags" })}</Label>
          <div className="grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-3">
            {dietaryOptions.map((option) => {
              const optionValue = option.value || option;
              const optionLabel = option.label || option;
              const isChecked = selectedDietary.includes(optionValue);

              return (
                <label
                  key={optionValue}
                  className="flex min-h-9 cursor-pointer items-start gap-2.5 py-1.5 text-[13px] leading-5 text-[#3f4954]"
                >
                  <input
                    checked={isChecked}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#23745d]"
                    disabled={disabled}
                    onChange={() => onAvailabilityToggle(optionValue)}
                    type="checkbox"
                  />
                  <span className="min-w-0 break-words">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#edf0f2] pt-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="flex items-center gap-2 text-[13px] font-semibold text-[#3f4954]"><Eye size={16} className="shrink-0 text-[#7b8793]" />
                {t("menu.availableImmediately", { defaultValue: "Available immediately" })}
              </strong>
            </div>

            <button
              role="switch"
              aria-checked={availableImmediately}
              aria-label={t("menu.availableImmediately", { defaultValue: "Available immediately" })}
              className={`relative h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23745d] ${
                availableImmediately ? "bg-[#23745d]" : "bg-[#cbd2d8]"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              disabled={disabled}
              onClick={onAvailabilityToggle}
              type="button"
            >
              <span
                className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  availableImmediately ? "left-[21px]" : "left-[3px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
