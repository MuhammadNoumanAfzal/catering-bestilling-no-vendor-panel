import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliveryTagList from "./DeliveryTagList";
import DeliveryTextInput from "./DeliveryTextInput";
import { useTranslation } from "react-i18next";

export default function DeliveryAreasSection({
  searchValue,
  searchResults,
  selectedAreas = [],
  onSearchChange,
  onAddArea,
  onRemoveArea,
  disabled = false,
  error = "",
  isSearching = false,
}) {
  const { t } = useTranslation();
  const showDropdown = !disabled && searchValue.trim();
  const hasResults = searchResults.length > 0;

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
        placeholder="Search by area name or postcode"
        value={searchValue}
      />

      {showDropdown ? (
        <div className="mt-3 rounded-[10px] border border-[#e3dad2] bg-[#fffdfb]">
          {isSearching ? (
            <p className="px-3 py-3 text-[13px] font-medium text-[#8d7f73]">
              {t("delivery.searching", { defaultValue: "Searching available areas…" })}
            </p>
          ) : hasResults ? (
            <div className="divide-y divide-[#efe7df]">
              {searchResults.map((area) => (
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
                    <span className="mt-1 inline-flex min-h-[22px] items-center rounded-full bg-[#f7f1eb] px-2.5 text-[11px] font-semibold text-[#6f6258]">
                      Postcode {area.postCode}
                    </span>
                  </span>
                  <span className="text-[12px] font-bold text-[#cf6e38]">{t("delivery.add", { defaultValue: "Add" })}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4">
              <p className="text-[13px] font-medium text-[#8d7f73]">
                No matching backend service areas found for this search.
              </p>
            </div>
          )}
        </div>
      ) : null}

      <DeliveryTagList
        disabled={disabled}
        items={selectedAreas}
        onRemove={onRemoveArea}
      />

      <DeliveryInfoNote>
        Select at least one active service area whenever delivery is enabled.
      </DeliveryInfoNote>
    </DeliverySectionCard>
  );
}
