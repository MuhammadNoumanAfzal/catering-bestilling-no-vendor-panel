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
  return (
    <CreateMenuSectionCard
      description="Set how you want to charge for this menu."
      title="Pricing & Capacity"
    >
      <div className="rounded-[10px] bg-[#f1efed] p-1">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${pricingModes.length}, minmax(0, 1fr))` }}
        >
          {pricingModes.map((mode) => {
            const isActive = pricingMode === mode;

            return (
              <button
                key={mode}
              className={`h-[34px] cursor-pointer rounded-[8px] text-[13px] font-bold transition ${
                  isActive
                    ? "bg-white text-[#17120e] shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                    : "text-[#6f645b]"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                disabled={disabled}
                onClick={() => setPricingMode(mode)}
                type="button"
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

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
