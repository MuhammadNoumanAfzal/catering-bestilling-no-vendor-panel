import CreateMenuSectionCard from "../create-menu/CreateMenuSectionCard";
import { Label, TextInput, UploadBox } from "../create-menu/CreateMenuFields";

export default function CreateAddOnBasicInfoSection({
  addOnName,
  category,
  categoryOptions,
  customCategory,
  image,
  onAddOnNameChange,
  onCategorySelect,
  onCustomCategoryChange,
  onImageSelect,
  onPriceChange,
  price,
}) {
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
              onChange={onAddOnNameChange}
              placeholder="e.g. Royal Wedding Grand Buffet"
              value={addOnName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
            <div>
              <Label>Price</Label>
              <TextInput
                onChange={onPriceChange}
                placeholder="0.00"
                type="number"
                value={price}
              />
            </div>

            <div className="rounded-[10px] border border-[#ddd4cb] bg-[#fffaf6] px-3 py-3">
              <Label>Category</Label>
              <p className="mb-2 text-[11px] font-medium text-[#8b7f74]">
                Create your add-on list for better management.
              </p>

              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#4f443d]">
                Choose a category
              </span>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => {
                  const isSelected = category === option;

                  return (
                    <button
                      key={option}
                      className={`cursor-pointer rounded-full border px-3 py-[6px] text-[11px] font-semibold transition ${
                        isSelected
                          ? "border-[#cf6e38] bg-[#fff1e8] text-[#cf6e38]"
                          : "border-[#d7cec4] bg-white text-[#544840]"
                      }`}
                      onClick={() => onCategorySelect(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-[#e6dbd2] pt-3">
                <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#4f443d]">
                  Or create a new category
                </span>
                <TextInput
                  onChange={onCustomCategoryChange}
                  placeholder="Enter category name (e.g. Sauces, Premium Items)"
                  value={customCategory}
                />
              </div>
            </div>
          </div>
        </div>
      </CreateMenuSectionCard>

      <CreateMenuSectionCard description="PNG, JPG or WEBP up to 5MB." title="Product Image">
        <UploadBox
          image={image}
          label="Click or drag to upload"
          onFileSelect={onImageSelect}
        />
      </CreateMenuSectionCard>
    </div>
  );
}
