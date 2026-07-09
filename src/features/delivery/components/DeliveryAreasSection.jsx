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
  customAreaDraft,
  customAreaErrors = {},
  onCustomAreaDraftChange,
  onCreateCustomArea,
  onResetCustomAreaDraft,
  isCreatingArea = false,
}) {
  const showDropdown = !disabled && searchValue.trim();
  const hasResults = searchResults.length > 0;
  const showCreateForm = showDropdown && !isSearching && !hasResults;

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

      {showDropdown ? (
        <div className="mt-3 rounded-[10px] border border-[#e3dad2] bg-[#fffdfb]">
          {isSearching ? (
            <p className="px-3 py-3 text-[13px] font-medium text-[#8d7f73]">
              Searching available areas...
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
            <div className="px-3 py-3">
              <p className="text-[13px] font-medium text-[#8d7f73]">
                No matching areas found. Create a custom area below.
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8b7d71]">
                    Area Name
                  </label>
                  <input
                    className={`w-full rounded-[8px] border px-3 py-2 text-[13px] text-[#1c1510] outline-none transition focus:border-[#d96e39] focus:ring-1 focus:ring-[#d96e39]/30 ${
                      customAreaErrors.name
                        ? "border-red-400 bg-red-50"
                        : "border-[#e3dad2] bg-white"
                    }`}
                    disabled={isCreatingArea}
                    onChange={(e) => onCustomAreaDraftChange("name", e.target.value)}
                    placeholder="e.g. Sandviken"
                    type="text"
                    value={customAreaDraft?.name || ""}
                  />
                  {customAreaErrors.name ? (
                    <p className="text-[11px] font-semibold text-red-500">
                      {customAreaErrors.name}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8b7d71]">
                    Post Code
                  </label>
                  <input
                    className={`w-full rounded-[8px] border px-3 py-2 text-[13px] text-[#1c1510] outline-none transition focus:border-[#d96e39] focus:ring-1 focus:ring-[#d96e39]/30 ${
                      customAreaErrors.postCode
                        ? "border-red-400 bg-red-50"
                        : "border-[#e3dad2] bg-white"
                    }`}
                    disabled={isCreatingArea}
                    inputMode="numeric"
                    onChange={(e) => onCustomAreaDraftChange("postCode", e.target.value)}
                    placeholder="e.g. 5035"
                    type="text"
                    value={customAreaDraft?.postCode || ""}
                  />
                  {customAreaErrors.postCode ? (
                    <p className="text-[11px] font-semibold text-red-500">
                      {customAreaErrors.postCode}
                    </p>
                  ) : null}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <button
                    className="flex h-8 items-center gap-1.5 rounded-[7px] bg-[#d96e39] px-4 text-[12px] font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isCreatingArea}
                    onClick={onCreateCustomArea}
                    type="button"
                  >
                    {isCreatingArea ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating...
                      </>
                    ) : (
                      "Create & Add"
                    )}
                  </button>
                  <button
                    className="h-8 rounded-[7px] border border-[#e3dad2] bg-white px-3 text-[12px] font-semibold text-[#7a6d63] transition hover:bg-[#faf4ef] active:scale-95 disabled:opacity-50"
                    disabled={isCreatingArea}
                    onClick={() => {
                      onResetCustomAreaDraft();
                      onSearchChange("");
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
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

