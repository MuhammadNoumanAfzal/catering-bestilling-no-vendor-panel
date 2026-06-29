import DeliverySectionCard from "./DeliverySectionCard";
import DeliveryInfoNote from "./DeliveryInfoNote";
import DeliveryTagList from "./DeliveryTagList";
import DeliveryTextInput from "./DeliveryTextInput";

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
  return (
    <DeliverySectionCard
      description="Add the service areas where customers can request delivery."
      disabled={disabled}
      title="Delivery Areas"
    >
      <DeliveryTextInput
        disabled={disabled}
        error={error}
        label="Search service area"
        onChange={onSearchChange}
        placeholder="Search by area name or postcode"
        value={searchValue}
      />

      {!disabled && searchValue.trim() ? (
        <div className="mt-3 rounded-[10px] border border-[#e3dad2] bg-[#fffdfb]">
          {isSearching ? (
            <p className="px-3 py-3 text-[13px] font-medium text-[#8d7f73]">
              Searching available areas...
            </p>
          ) : searchResults.length ? (
            <div className="divide-y divide-[#efe7df]">
              {searchResults.map((area) => (
                <button
                  key={area.id}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition hover:bg-[#faf4ef]"
                  onClick={() => onAddArea(area)}
                  type="button"
                >
                  <span>
                    <span className="block text-[13px] font-bold text-[#241c17]">
                      {area.name}
                    </span>
                    <span className="block text-[12px] text-[#8b7d71]">
                      {area.postCode}
                    </span>
                  </span>
                  <span className="text-[12px] font-bold text-[#cf6e38]">Add</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-3 text-[13px] font-medium text-[#8d7f73]">
              No matching service areas found.
            </p>
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
