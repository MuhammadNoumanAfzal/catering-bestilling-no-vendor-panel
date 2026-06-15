import { X } from "lucide-react";

import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, SelectInput, TextInput, UploadBox } from "./CreateMenuFields";

export default function CreateMenuItemsSection({
  addMenuItem,
  allergenOptions,
  disabled = false,
  handleItemImageSelect,
  menuItems,
  onAddFromOtherPackage,
  removeMenuItem,
  updateMenuItem,
}) {
  return (
    <CreateMenuSectionCard
      description="Add the dishes and drinks included in the base price."
      title="Menu Items"
    >
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[108px_minmax(0,1fr)] gap-3 rounded-[10px] border border-[#e4dbd2] p-3 max-[720px]:grid-cols-1"
          >
            <UploadBox
              compact
              disabled={disabled}
              image={item.image}
              label="Click or drag to upload"
              onFileSelect={(file) => handleItemImageSelect(item.id, file)}
            />

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-[#211913]">Title</span>
                <button
                  className="cursor-pointer text-[#e06c39] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => removeMenuItem(item.id)}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
              <TextInput
                disabled={disabled}
                onChange={(event) => updateMenuItem(item.id, "title", event.target.value)}
                placeholder="Grilled Chicken"
                value={item.title}
              />

              <div className="mt-3">
                <Label>Allergens</Label>
                <SelectInput
                  disabled={disabled}
                  onChange={(event) => updateMenuItem(item.id, "allergen", event.target.value)}
                  options={allergenOptions}
                  placeholder="Select allergy info"
                  value={item.allergen}
                />
              </div>

              <button
                className="mt-3 h-[40px] cursor-pointer rounded-[8px] bg-[#cf6e38] px-4 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
                onClick={onAddFromOtherPackage}
                type="button"
              >
                Add item from other package
              </button>
            </div>
          </div>
        ))}

        <button
          className="h-[38px] w-full cursor-pointer rounded-[8px] border border-[#d6cdc4] bg-white text-[13px] font-bold text-[#332922] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={addMenuItem}
          type="button"
        >
          + Add Another Item
        </button>
      </div>
    </CreateMenuSectionCard>
  );
}
