import CreateMenuSectionCard from "../create-menu/CreateMenuSectionCard";
import { Label, TextInput } from "../create-menu/CreateMenuFields";

export default function CreateAddOnAvailabilitySection({
  availableImmediately,
  customCategory,
  dietaryOptions,
  onAvailabilityToggle,
  selectedDietary,
}) {
  return (
    <CreateMenuSectionCard
      description="Define how this add-on should appear across your active menus."
      title="Availability & Tags"
    >
      <div className="space-y-4">
        <div>
          <Label>Dietary Tags</Label>
          <div className="grid grid-cols-2 gap-2">
            {dietaryOptions.map((option) => {
              const isChecked = selectedDietary.includes(option);

              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-[#ddd4cb] bg-white px-3 py-2 text-[13px] font-semibold text-[#3f342d]"
                >
                  <input
                    checked={isChecked}
                    className="h-4 w-4 cursor-pointer accent-[#cf6e38]"
                    onChange={() => onAvailabilityToggle(option)}
                    type="checkbox"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-[10px] bg-[#f7f2ed] px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="block text-[14px] font-bold text-[#1f1814]">
                Available immediately
              </strong>
              <p className="mt-1 text-[13px] font-medium text-[#8b7f74]">
                Will be visible on active menus.
              </p>
            </div>

            <button
              aria-pressed={availableImmediately}
              className={`relative mt-1 h-[20px] w-[36px] cursor-pointer rounded-full transition ${
                availableImmediately ? "bg-[#df7b45]" : "bg-[#d8cec6]"
              }`}
              onClick={onAvailabilityToggle}
              type="button"
            >
              <span
                className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.16)] transition ${
                  availableImmediately ? "left-[18px]" : "left-[2px]"
                }`}
              />
            </button>
          </div>
        </div>

        <div>
          <Label>Selected Category</Label>
          <TextInput
            disabled
            placeholder="No category selected yet"
            value={customCategory}
          />
        </div>
      </div>
    </CreateMenuSectionCard>
  );
}
