import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, TextInput } from "./CreateMenuFields";

export default function CreateMenuPricingSection({
  basePrice,
  disabled = false,
  minimumGuests,
  onBasePriceChange,
  onMinimumGuestsChange,
  pricingMode,
  pricingModes,
  setPricingMode,
}) {
  function getModeValue(mode) {
    return typeof mode === "string" ? mode : mode.value;
  }

  function getModeLabel(mode) {
    return typeof mode === "string" ? mode : mode.label;
  }

  const hasPricingModes = pricingModes.length > 0;

  return (
    <CreateMenuSectionCard
      description="Set how you want to charge for this menu."
      title="Pricing & Capacity"
    >
      {hasPricingModes ? (
        <div className="rounded-[10px] bg-[#f1efed] p-1">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${pricingModes.length}, minmax(0, 1fr))` }}
          >
            {pricingModes.map((mode) => {
              const modeValue = getModeValue(mode);
              const isActive = pricingMode === modeValue;

              return (
                <button
                  key={modeValue}
                  className={`h-[34px] cursor-pointer rounded-[8px] text-[13px] font-bold transition ${
                    isActive
                      ? "bg-white text-[#17120e] shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                      : "text-[#6f645b]"
                  } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  disabled={disabled}
                  onClick={() => setPricingMode(modeValue)}
                  type="button"
                >
                  {getModeLabel(mode)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-[#dfd5cb] bg-[#faf7f4] px-3 py-2 text-[12px] font-medium text-[#8a7c70]">
          Pricing type is not available from the API right now.
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
        <div>
          <Label>Base Price</Label>
          <TextInput
            disabled={disabled}
            onChange={onBasePriceChange}
            placeholder="kr 120"
            value={basePrice}
          />
        </div>
        <div>
          <Label>Minimum Guests</Label>
          <TextInput
            disabled={disabled}
            onChange={onMinimumGuestsChange}
            placeholder="20"
            value={minimumGuests}
          />
        </div>
      </div>
    </CreateMenuSectionCard>
  );
}
