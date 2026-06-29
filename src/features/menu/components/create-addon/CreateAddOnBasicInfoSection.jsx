import CreateMenuSectionCard from "../create-menu/CreateMenuSectionCard";
import {
  Label,
  MultiSelectInput,
  TextArea,
  TextInput,
  UploadBox,
} from "../create-menu/CreateMenuFields";

export default function CreateAddOnBasicInfoSection({
  addOnName,
  category,
  categoryOptions,
  customCategory,
  description,
  disabled = false,
  image,
  mealTypeOptions,
  mealTypes,
  onAddOnNameChange,
  onCategorySelect,
  onCustomCategoryChange,
  onDescriptionChange,
  onImageSelect,
  onMealTypesChange,
  onPriceChange,
  price,
}) {
  function getOptionValue(option) {
    return typeof option === "string" ? option : option.value;
  }

  function getOptionLabel(option) {
    return typeof option === "string" ? option : option.label;
  }

  return (
    <div className="grid grid-cols-[minmax(0,1.32fr)_minmax(240px,0.78fr)] gap-4 max-[980px]:grid-cols-1">
      <CreateMenuSectionCard
        description="Create a new extra item for your customers to customize their meals."
        title="Add-on Details"
      >
        <div className="grid gap-4">
          <div>
            <Label>Add-on Name</Label>
            <TextInput
              disabled={disabled}
              onChange={onAddOnNameChange}
              placeholder="e.g. Royal Wedding Grand Buffet"
              value={addOnName}
            />
          </div>

          <div>
            <Label>Description</Label>
            <TextArea
              disabled={disabled}
              onChange={onDescriptionChange}
              placeholder="Describe this add-on and how it complements your menus..."
              value={description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
            <div>
              <Label>Price</Label>
              <TextInput
                disabled={disabled}
                onChange={onPriceChange}
                placeholder="0.00"
                type="number"
                value={price}
              />
            </div>

            <div>
              <Label>Meal Types</Label>
              <MultiSelectInput
                disabled={disabled}
                onChange={onMealTypesChange}
                options={mealTypeOptions}
                placeholder="Select one or more meal types"
                value={mealTypes}
              />
            </div>
          </div>

          <div className="rounded-[10px] border border-[#ddd4cb] bg-[#fffaf6] px-3 py-3">
            <Label>Category</Label>
            <p className="mb-2 text-[13px] font-medium text-[#8b7f74]">
              Create your add-on list for better management.
            </p>

            <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#4f443d]">
              Choose a category
            </span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = category === optionValue;

                return (
                  <button
                    key={optionValue}
                    className={`cursor-pointer rounded-full border px-3 py-[6px] text-[13px] font-semibold transition ${
                      isSelected
                        ? "border-[#cf6e38] bg-[#fff1e8] text-[#cf6e38]"
                        : "border-[#d7cec4] bg-white text-[#544840]"
                    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                    disabled={disabled}
                    onClick={() => onCategorySelect(optionValue)}
                    type="button"
                  >
                    {optionLabel}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-[#e6dbd2] pt-3">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#4f443d]">
                Or create a new category
              </span>
              <TextInput
                disabled={disabled}
                onChange={onCustomCategoryChange}
                placeholder="Enter category name (e.g. Sauces, Premium Items)"
                value={customCategory}
              />
            </div>
          </div>
        </div>
      </CreateMenuSectionCard>

      <CreateMenuSectionCard description="PNG, JPG or WEBP up to 5MB." title="Product Image">
        <UploadBox
          disabled={disabled}
          image={image}
          label="Click or drag to upload"
          onFileSelect={onImageSelect}
        />
      </CreateMenuSectionCard>
    </div>
  );
}
