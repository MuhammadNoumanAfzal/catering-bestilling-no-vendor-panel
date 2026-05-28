import { useState } from "react";
import { Plus } from "lucide-react";
import MenuAvailabilityCard from "../components/MenuAvailabilityCard";
import MenuCategoryPanel from "../components/MenuCategoryPanel";
import MenuCheckboxGroup from "../components/MenuCheckboxGroup";
import MenuImageUploadCard from "../components/MenuImageUploadCard";
import MenuTextField from "../components/MenuTextField";
import { dietaryTags, presetCategories } from "../data/menuData";
import {
  showMenuSavedSuccess,
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

export default function MenuPage() {
  const [addOnName, setAddOnName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedTags, setSelectedTags] = useState(["Vegetarian"]);
  const [availableImmediately, setAvailableImmediately] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Beverages");
  const [newCategory, setNewCategory] = useState("");

  function handleTagToggle(tag) {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  }

  async function handleAddAnotherItem() {
    setAddOnName("");
    setPrice("");
    setSelectedTags(["Vegetarian"]);
    setAvailableImmediately(true);
    setSelectedCategory("Beverages");
    setNewCategory("");
    await showVendorSuccessToast("Ready to add another item.");
  }

  async function handleCancel() {
    setAddOnName("");
    setPrice("");
    setSelectedTags(["Vegetarian"]);
    setAvailableImmediately(true);
    setSelectedCategory("Beverages");
    setNewCategory("");
    await showVendorSuccessToast("Menu changes discarded.");
  }

  async function handleSave() {
    if (!addOnName.trim() || !price.trim()) {
      await showVendorErrorAlert("Please fill in the add-on name and price before saving.");
      return;
    }

    await showMenuSavedSuccess();
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col rounded-[20px] bg-[#fffdfb] px-6 py-5 shadow-[0_10px_28px_rgba(53,34,19,0.05)] max-[720px]:px-4 max-[720px]:py-4">
      <header>
        <h1 className="type-h3 m-0 tracking-[-0.03em] text-[#12100f]">Add New Add-on</h1>
        <p className="type-subpara mt-1 text-[#746a62]">
          Create a new extra item for your customers to customize their meals.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-[minmax(0,1.6fr)_minmax(250px,0.95fr)] gap-x-8 gap-y-6 max-[1024px]:grid-cols-1">
        <div className="flex flex-col gap-5">
          <MenuTextField
            label="Add-on Name"
            onChange={(event) => setAddOnName(event.target.value)}
            placeholder="e.g. Spicy Mayo, Garlic Butter"
            value={addOnName}
          />

          <div className="grid grid-cols-[minmax(0,118px)_minmax(0,1fr)] gap-10 max-[720px]:grid-cols-1 max-[720px]:gap-5">
            <MenuTextField
              label="Price"
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              value={price}
            />

            <MenuCategoryPanel
              categories={presetCategories}
              newCategory={newCategory}
              onCategorySelect={setSelectedCategory}
              onNewCategoryChange={setNewCategory}
              selectedCategory={selectedCategory}
            />
          </div>

          <div className="max-w-[312px]">
            <MenuCheckboxGroup
              items={dietaryTags}
              label="Dietary Tags"
              onToggle={handleTagToggle}
              selectedItems={selectedTags}
            />
          </div>

          <div className="max-w-[312px]">
            <MenuAvailabilityCard
              enabled={availableImmediately}
              onToggle={() => setAvailableImmediately((currentValue) => !currentValue)}
            />
          </div>
        </div>

        <div className="pt-[2px]">
          <MenuImageUploadCard />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
        <button
          className="type-subpara flex h-[36px] w-full max-w-[312px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-[#cbc4bd] bg-white text-[#211913]"
          onClick={handleAddAnotherItem}
          type="button"
        >
          <Plus size={12} />
          <span>Add Another Item</span>
        </button>

        <div className="flex items-center gap-3 self-end max-[720px]:self-auto">
          <button
            className="h-[38px] min-w-[104px] cursor-pointer rounded-[8px] border border-[#4a4038] bg-white px-4 text-[12px] font-bold text-[#15110f]"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-[38px] min-w-[110px] cursor-pointer rounded-[8px] bg-[#d96e39] px-4 text-[12px] font-bold text-white shadow-[0_6px_16px_rgba(217,110,57,0.26)]"
            onClick={handleSave}
            type="button"
          >
            Save Add-ons
          </button>
        </div>
      </div>
    </section>
  );
}
