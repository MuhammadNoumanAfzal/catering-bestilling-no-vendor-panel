import { X } from "lucide-react";

import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, MultiSelectInput, TextInput, UploadBox } from "./CreateMenuFields";

export default function CreateMenuItemsSection({
  addMenuItem,
  allergenFeatureMessage = "",
  allergenFeatureUnavailable = false,
  allergenOptions,
  disabled = false,
  handleItemImageSelect,
  menuItems,
  onAddNewAllergenClick,
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
                <Label>Description</Label>
                <textarea
                  disabled={disabled}
                  onChange={(event) =>
                    updateMenuItem(item.id, "description", event.target.value)
                  }
                  placeholder="Add a short description for this item"
                  rows={3}
                  value={item.description || ""}
                  className="min-h-[96px] w-full rounded-[8px] border border-[#ded4cb] bg-white px-3 py-2.5 text-[14px] text-[#211913] outline-none placeholder:text-[#a59689] disabled:cursor-not-allowed disabled:bg-[#f6f1ec] disabled:text-[#8c7f73]"
                />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <Label>Allergens</Label>
                  {!disabled && !allergenFeatureUnavailable ? (
                    <button
                      type="button"
                      onClick={onAddNewAllergenClick}
                      className="cursor-pointer text-[12px] font-extrabold text-[#cf6e38] transition hover:text-[#bf622f]"
                    >
                      + Add New
                    </button>
                  ) : null}
                </div>
                <MultiSelectInput
                  disabled={disabled || allergenFeatureUnavailable}
                  onChange={(value) => updateMenuItem(item.id, "allergens", value)}
                  options={allergenOptions}
                  placeholder={
                    allergenFeatureUnavailable
                      ? "Allergen API not available in production yet"
                      : "Select one or more allergens"
                  }
                  value={item.allergens}
                />
                {allergenFeatureMessage ? (
                  <p className="mt-1 text-[12px] font-medium text-[#8a7c70]">
                    {allergenFeatureMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-3 max-[480px]:flex-col">
          <button
            className="flex-1 h-[38px] cursor-pointer rounded-[8px] border border-[#d6cdc4] bg-white text-[13px] font-bold text-[#332922] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#faf7f5] transition active:scale-95"
            disabled={disabled}
            onClick={addMenuItem}
            type="button"
          >
            + Add Another Item
          </button>
          <button
            className="flex-1 h-[38px] cursor-pointer rounded-[8px] bg-[#cf6e38] text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#bf622f] transition active:scale-95"
            disabled={disabled}
            onClick={onAddFromOtherPackage}
            type="button"
          >
            Add item from other package
          </button>
        </div>
      </div>
    </CreateMenuSectionCard>
  );
}
