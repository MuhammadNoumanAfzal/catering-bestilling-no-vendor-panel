import i18n from "../../../i18n";
import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliveryTagList from "./DeliveryTagList";
import DeliveryTextInput from "./DeliveryTextInput";
import { useTranslation } from "react-i18next";

export default function DeliveryAreasSection({
  searchValue,
  searchResults,
  cityAreas = [],
  selectedAreas = [],
  onSearchChange,
  onAddArea,
  onAddCityAreas,
  onRemoveArea,
  disabled = false,
  error = "",
  isSearching = false,
}) {
  const { t } = useTranslation();
  const showDropdown = !disabled && searchValue.trim();
  const hasResults = searchResults.length > 0;
  const cityName = cityAreas[0]?.name || "";

  return (
    <DeliverySectionCard
      description={t("delivery.areasDescription", { defaultValue: "Add the service areas where customers can request delivery." })}
      disabled={disabled}
      title={t("delivery.areas", { defaultValue: "Delivery Areas" })}
    >
      <DeliveryTextInput
        disabled={disabled}
        error={error}
        label={t("delivery.searchArea", { defaultValue: "Search service area" })}
        onChange={onSearchChange}
        placeholder={i18n.t("delivery.searchAreaPlaceholder")}
        value={searchValue}
      />

      {showDropdown && cityAreas.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#f0d7c6] bg-[#fff7f1] px-3 py-3">
          <div>
            <p className="text-[13px] font-bold text-[#241c17]">{t("delivery.cityPostalCodes", { city: cityName, count: cityAreas.length, defaultValue: `${cityName} postal codes (${cityAreas.length})` })}</p>
            <p className="mt-0.5 text-[12px] text-[#7d6d61]">{t("delivery.addAllCityHint", { defaultValue: "Add every available postal code for this city." })}</p>
          </div>
          <button className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#d96e39] px-3 text-[12px] font-bold text-white transition hover:bg-[#c95f2c]" onClick={() => onAddCityAreas?.(cityAreas)} type="button">{t("delivery.addAllCity", { city: cityName, defaultValue: `Add all ${cityName}` })}</button>
        </div>
      ) : null}
      {showDropdown ? (
        <div className="mt-3 rounded-[10px] border border-[#e3dad2] bg-[#fffdfb]">
          {isSearching ? (
            <p className="px-3 py-3 text-[13px] font-medium text-[#8d7f73]">
              {t("delivery.searching", { defaultValue: "Searching available areas…" })}
            </p>
          ) : hasResults ? (
            <div className="divide-y divide-[#efe7df]">
              {searchResults.slice(0, 10).map((area) => (
                <button
                  key={area.id}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition hover:bg-[#faf4ef]"
                  onClick={() => onAddArea(area)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-[#241c17]">
                      {area.name}
                    </span>
                    <span className="mt-1 inline-flex min-h-[22px] items-center rounded-full bg-[#f7f1eb] px-2.5 text-[11px] font-semibold text-[#6f6258]"> {i18n.t("delivery.postcode")} {area.postCode}
                    </span>
                  </span>
                  <span className="text-[12px] font-bold text-[#cf6e38]">{t("delivery.add", { defaultValue: "Add" })}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4">
              <p className="text-[13px] font-medium text-[#8d7f73]"> {i18n.t("delivery.noMatchingAreas")} </p>
            </div>
          )}
        </div>
      ) : null}

      <DeliveryTagList
        disabled={disabled}
        items={selectedAreas}
        onRemove={onRemoveArea}
      />

      <DeliveryInfoNote> {i18n.t("delivery.areaRequired")} </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
