import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CreateAddOnActionsBar from "../components/create-addon/CreateAddOnActionsBar";
import CreateAddOnAvailabilitySection from "../components/create-addon/CreateAddOnAvailabilitySection";
import CreateAddOnBasicInfoSection from "../components/create-addon/CreateAddOnBasicInfoSection";
import {
  addOnCategoryOptions,
  dietaryOptions,
} from "../data/menuData";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const ADD_ON_DRAFT_STORAGE_KEY = "vendor-addon-builder-state";
const ADD_ON_ITEMS_STORAGE_KEY = "vendor-addon-items";

function getInitialAddOnState() {
  return {
    addOnName: "",
    price: "",
    category: "",
    customCategory: "",
    image: "",
    selectedDietary: [],
    availableImmediately: true,
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

export default function CreateAddOnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [addOnName, setAddOnName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [image, setImage] = useState("");
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [availableImmediately, setAvailableImmediately] = useState(true);
  const [stagedItems, setStagedItems] = useState([]);

  const mode = searchParams.get("mode") || "create";
  const editId = searchParams.get("id");
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (isEditMode && editId) {
      const savedAddOnsRaw = window.localStorage.getItem(ADD_ON_ITEMS_STORAGE_KEY);
      const savedAddOns = savedAddOnsRaw ? JSON.parse(savedAddOnsRaw) : [];
      const itemToEdit = savedAddOns.find(
        (entry) => entry.id.toString() === editId.toString()
      );

      if (itemToEdit) {
        setAddOnName(itemToEdit.addOnName || itemToEdit.name || "");
        setPrice(itemToEdit.price?.toString().replace(/[^0-9.]/g, "") || "");
        setCategory(itemToEdit.category || "");
        setCustomCategory(itemToEdit.customCategory || "");
        setImage(itemToEdit.image || "");
        setSelectedDietary(itemToEdit.selectedDietary || []);
        setAvailableImmediately(itemToEdit.availableImmediately ?? true);
      }
    } else {
      const savedDraftRaw = window.localStorage.getItem(ADD_ON_DRAFT_STORAGE_KEY);

      if (!savedDraftRaw) {
        return;
      }

      const savedDraft = JSON.parse(savedDraftRaw);
      setAddOnName(savedDraft.addOnName || "");
      setPrice(savedDraft.price || "");
      setCategory(savedDraft.category || "");
      setCustomCategory(savedDraft.customCategory || "");
      setImage(savedDraft.image || "");
      setSelectedDietary(savedDraft.selectedDietary || []);
      setAvailableImmediately(savedDraft.availableImmediately ?? true);
      setStagedItems(savedDraft.stagedItems || []);
    }
  }, [isEditMode, editId]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }
    window.localStorage.setItem(
      ADD_ON_DRAFT_STORAGE_KEY,
      JSON.stringify({
        addOnName,
        price,
        category,
        customCategory,
        image,
        selectedDietary,
        availableImmediately,
        stagedItems,
      }),
    );
  }, [
    addOnName,
    availableImmediately,
    category,
    customCategory,
    image,
    price,
    selectedDietary,
    stagedItems,
    isEditMode,
  ]);

  const resolvedCategory = useMemo(
    () => customCategory.trim() || category,
    [category, customCategory],
  );

  function resetForm() {
    const nextState = getInitialAddOnState();
    setAddOnName(nextState.addOnName);
    setPrice(nextState.price);
    setCategory(nextState.category);
    setCustomCategory(nextState.customCategory);
    setImage(nextState.image);
    setSelectedDietary(nextState.selectedDietary);
    setAvailableImmediately(nextState.availableImmediately);
  }

  function toggleDietaryTag(tag) {
    setSelectedDietary((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  async function handleImageUpload(file) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      await showVendorErrorAlert("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await showVendorErrorAlert("Please upload an image under 5MB.");
      return;
    }

    try {
      const imageData = await fileToDataUrl(file);
      setImage(imageData);
      await showVendorSuccessToast("Product image uploaded.");
    } catch {
      await showVendorErrorAlert("Unable to process the selected image.");
    }
  }

  async function validateAddOn() {
    if (!addOnName.trim()) {
      await showVendorErrorAlert("Please enter an add-on name.");
      return false;
    }

    if (!price.toString().trim()) {
      await showVendorErrorAlert("Please enter a price for this add-on.");
      return false;
    }

    if (!resolvedCategory) {
      await showVendorErrorAlert("Please choose or create a category.");
      return false;
    }

    return true;
  }

  function buildAddOnPayload() {
    return {
      id: `addon-${Date.now()}`,
      addOnName: addOnName.trim(),
      price: price.toString().trim(),
      category: resolvedCategory,
      image,
      selectedDietary,
      availableImmediately,
    };
  }

  async function handleAddAnother() {
    const isValid = await validateAddOn();

    if (!isValid) {
      return;
    }

    setStagedItems((current) => [...current, buildAddOnPayload()]);
    resetForm();
    await showVendorSuccessToast("Add-on added. You can create another one now.");
  }

  async function handleSave() {
    if (isEditMode) {
      const isValid = await validateAddOn();
      if (!isValid) {
        return;
      }

      const savedItemsRaw = window.localStorage.getItem(ADD_ON_ITEMS_STORAGE_KEY);
      let savedItems = savedItemsRaw ? JSON.parse(savedItemsRaw) : [];

      savedItems = savedItems.map((item) => {
        if (item.id.toString() === editId.toString()) {
          return {
            ...item,
            addOnName: addOnName.trim(),
            price: price.toString().trim(),
            category: resolvedCategory,
            image,
            selectedDietary,
            availableImmediately,
          };
        }
        return item;
      });

      window.localStorage.setItem(ADD_ON_ITEMS_STORAGE_KEY, JSON.stringify(savedItems));
      await showVendorSuccessToast("Add-on updated successfully.");
      navigate("/menu");
      return;
    }

    const hasCurrentValues = Boolean(
      addOnName.trim() ||
        price.toString().trim() ||
        category.trim() ||
        customCategory.trim() ||
        image ||
        selectedDietary.length,
    );

    let nextItems = [...stagedItems];

    if (hasCurrentValues) {
      const isValid = await validateAddOn();

      if (!isValid) {
        return;
      }

      nextItems = [...nextItems, buildAddOnPayload()];
    }

    if (!nextItems.length) {
      await showVendorErrorAlert("Add at least one add-on before saving.");
      return;
    }

    const savedItemsRaw = window.localStorage.getItem(ADD_ON_ITEMS_STORAGE_KEY);
    const savedItems = savedItemsRaw ? JSON.parse(savedItemsRaw) : [];

    window.localStorage.setItem(
      ADD_ON_ITEMS_STORAGE_KEY,
      JSON.stringify([...savedItems, ...nextItems]),
    );
    window.localStorage.removeItem(ADD_ON_DRAFT_STORAGE_KEY);
    await showVendorSuccessToast("Add-ons saved successfully.");
    navigate("/menu");
  }

  async function handleCancel() {
    window.localStorage.removeItem(ADD_ON_DRAFT_STORAGE_KEY);
    resetForm();
    setStagedItems([]);
    navigate("/menu");
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <header className="mb-5">
        <button
          className="mb-2 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-semibold text-[#6d84d6]"
          onClick={() => navigate("/menu")}
          type="button"
        >
          <ChevronLeft size={14} />
          Menu management
        </button>
        <h1 className="type-h2 m-0 text-[#15110f]">
          {isEditMode ? "Edit Add-on" : "Add New Add-on"}
        </h1>
        <p className="mt-1 text-[15px] font-medium text-[#746a62]">
          {isEditMode
            ? "Update the details and configuration of your add-on item."
            : "Create a new extra item for your customers to customize their meals."}
        </p>
      </header>

      <div className="space-y-4">
        <CreateAddOnBasicInfoSection
          addOnName={addOnName}
          category={category}
          categoryOptions={addOnCategoryOptions}
          customCategory={customCategory}
          image={image}
          onAddOnNameChange={(event) => setAddOnName(event.target.value)}
          onCategorySelect={setCategory}
          onCustomCategoryChange={(event) => setCustomCategory(event.target.value)}
          onImageSelect={handleImageUpload}
          onPriceChange={(event) => setPrice(event.target.value)}
          price={price}
        />

        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 max-[980px]:grid-cols-1">
          <CreateAddOnAvailabilitySection
            availableImmediately={availableImmediately}
            customCategory={resolvedCategory}
            dietaryOptions={dietaryOptions}
            onAvailabilityToggle={(value) => {
              if (typeof value === "string") {
                toggleDietaryTag(value);
                return;
              }

              setAvailableImmediately((current) => !current);
            }}
            selectedDietary={selectedDietary}
          />
        </div>
      </div>

      <CreateAddOnActionsBar
        onAddAnother={handleAddAnother}
        onCancel={handleCancel}
        onSave={handleSave}
        stagedCount={stagedItems.length}
        isEditMode={isEditMode}
      />
    </section>
  );
}
