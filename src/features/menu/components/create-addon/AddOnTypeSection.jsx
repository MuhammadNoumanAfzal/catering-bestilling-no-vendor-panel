import { useTranslation } from "react-i18next";
import { Layers2, Package, UsersRound, Wheat } from "lucide-react";

export default function AddOnTypeSection({ form, onChange, disabled, allergenOptions }) {
  const { i18n } = useTranslation();
  const no = i18n.language?.startsWith("no") || i18n.language?.startsWith("nb");
  const text = (english, norwegian) => no ? norwegian : english;
  return (
    <div className="border-y border-[#e5e7eb] py-5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <fieldset disabled={disabled} className="min-w-0">
          <legend className="mb-2.5 text-[13px] font-semibold text-[#525b65]">{text("Add-on type", "Type tilleggsprodukt")}</legend>
          <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-[#f1f3f5] p-1">
            {[["DEPENDENT", text("Menu add-on", "Menytillegg"), Layers2], ["INDEPENDENT", text("Standalone product", "Frittst\u00e5ende produkt"), Package]].map(([value, label, Icon]) => (
              <label key={value} className={`relative flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-[13px] font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#23745d] ${form.addOnType === value ? "bg-white text-[#17634c] shadow-sm" : "text-[#66717d] hover:text-[#202a34]"} ${disabled ? "pointer-events-none opacity-60" : ""}`}>
                <input className="sr-only" type="radio" name="addOnType" value={value} checked={form.addOnType === value} onChange={() => onChange("addOnType", value)} />
                <Icon size={16} aria-hidden="true" />{label}
              </label>
            ))}
          </div>
        </fieldset>
        {form.addOnType === "INDEPENDENT" && <label className="w-full text-[13px] font-semibold text-[#525b65] sm:w-48">
          <span className="mb-2.5 flex items-center gap-2"><UsersRound size={15} />{text("Minimum guests", "Minimum antall gjester")}</span>
          <input disabled={disabled} className="h-11 w-full rounded-md border border-[#dce1e6] bg-white px-3 text-sm font-medium text-[#202a34] outline-none focus:border-[#23745d] focus:ring-2 focus:ring-[#23745d]/10 disabled:opacity-50" type="number" min="1" step="1" value={form.minimumGuests} onChange={(event) => onChange("minimumGuests", event.target.value)} />
        </label>}
      </div>
      {form.addOnType === "INDEPENDENT" && <fieldset disabled={disabled} className="mt-5 border-t border-[#edf0f2] pt-4">
        <legend className="float-left mb-3 flex w-full items-center gap-2 text-[13px] font-semibold text-[#525b65]"><Wheat size={15} />{text("Allergens", "Allergener")}</legend>
        <div className="clear-both grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 xl:grid-cols-4">
          {allergenOptions.map((option) => (
            <label key={option.value} className="flex min-h-9 cursor-pointer items-start gap-2.5 py-1.5 text-[13px] leading-5 text-[#3f4954]">
              <input className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#23745d]" type="checkbox" checked={form.allergens.includes(option.value)} onChange={() => onChange("allergens", form.allergens.includes(option.value) ? form.allergens.filter((id) => id !== option.value) : [...form.allergens, option.value])} />
              <span className="min-w-0 break-words">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>}
    </div>
  );
}
