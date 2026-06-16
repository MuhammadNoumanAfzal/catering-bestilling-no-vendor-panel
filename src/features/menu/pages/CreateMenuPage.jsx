import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CreateMenuActionsBar from "../components/create-menu/CreateMenuActionsBar";
import CreateMenuAddOnsSection from "../components/create-menu/CreateMenuAddOnsSection";
import CreateMenuAvailabilitySection from "../components/create-menu/CreateMenuAvailabilitySection";
import CreateMenuBasicInfoSection from "../components/create-menu/CreateMenuBasicInfoSection";
import CreateMenuItemsSection from "../components/create-menu/CreateMenuItemsSection";
import CreateMenuPricingSection from "../components/create-menu/CreateMenuPricingSection";
import ImportMenuItemsModal from "../components/create-menu/ImportMenuItemsModal";
import AddCategoryModal from "../components/create-menu/AddCategoryModal";
import {
  allergenOptions,
  availabilityDays,
  menuCategoryOptions,
  dietaryOptions,
  initialCreateMenuItems,
  leadTimeOptions,
  menuTypeOptions,
  optionalAddOns,
  pricingModes,
} from "../data/menuData";
import {
  showMenuSavedSuccess,
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const MENU_DRAFT_STORAGE_KEY = "vendor-menu-builder-state";
const MENU_SELECTED_ITEM_STORAGE_KEY = "vendor-menu-selected-item";

function getInitialMenuState() {
  return {
    menuTitle: "",
    description: "",
    category: "",
    menuType: "Per Person",
    coverImage: "",
    galleryImages: [],
    selectedDays: [],
    leadTime: "24",
    blackoutDate: "",
    selectedDietary: [],
    customDietary: "",
    pricingMode: "Per Person",
    basePrice: "",
    minimumGuests: "",
    menuItems: initialCreateMenuItems,
    addOnSearch: "",
    selectedAddOnIds: [],
    status: "draft",
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

export default function CreateMenuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuTitle, setMenuTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [menuType, setMenuType] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [leadTime, setLeadTime] = useState("24");
  const [blackoutDate, setBlackoutDate] = useState("");
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [customDietary, setCustomDietary] = useState("");
  const [pricingMode, setPricingMode] = useState("Per Person");
  const [basePrice, setBasePrice] = useState("");
  const [minimumGuests, setMinimumGuests] = useState("");
  const [menuItems, setMenuItems] = useState(initialCreateMenuItems);
  const [addOnSearch, setAddOnSearch] = useState("");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(() => {
    const savedCategoriesRaw = window.localStorage.getItem("vendor-menu-categories");
    if (savedCategoriesRaw) {
      return JSON.parse(savedCategoriesRaw);
    } else {
      const defaultCategories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Corporate"];
      window.localStorage.setItem("vendor-menu-categories", JSON.stringify(defaultCategories));
      return defaultCategories;
    }
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const mode = searchParams.get("mode") || "create";

  function handleAddCategory(newCategoryName) {
    setCategoryOptions((current) => {
      if (current.includes(newCategoryName)) return current;
      const updated = [...current, newCategoryName];
      window.localStorage.setItem("vendor-menu-categories", JSON.stringify(updated));
      return updated;
    });
    setCategory(newCategoryName);
  }

  function handleAddImportedItems(selectedItemsList) {
    setMenuItems((current) => {
      const newItems = selectedItemsList.map((item) => ({
        id: Date.now() + Math.random(),
        title: item.title || "",
        allergen: item.allergen || "",
        image: item.image || "",
      }));
      const isSingleEmpty = current.length === 1 && !current[0].title && !current[0].allergen && !current[0].image;
      if (isSingleEmpty) {
        return newItems;
      }
      return [...current, ...newItems];
    });
  }
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  useEffect(() => {
    const selectedItemRaw = window.localStorage.getItem(MENU_SELECTED_ITEM_STORAGE_KEY);
    const selectedItem = selectedItemRaw ? JSON.parse(selectedItemRaw) : null;
    const initialState =
      (isViewMode || isEditMode) && selectedItem
        ? {
            ...getInitialMenuState(),
            menuTitle: selectedItem.title || "",
            description: selectedItem.description || "",
            category: selectedItem.category || "",
            menuType: selectedItem.menuType || "",
            coverImage: selectedItem.coverImage || selectedItem.image || "",
            galleryImages: selectedItem.galleryImages && Array.isArray(selectedItem.galleryImages)
              ? selectedItem.galleryImages
              : (selectedItem.galleryImage ? [selectedItem.galleryImage] : []),
            selectedDays: selectedItem.selectedDays || [],
            leadTime: selectedItem.leadTime || "24",
            blackoutDate: selectedItem.blackoutDate || "",
            selectedDietary: selectedItem.selectedDietary || [],
            customDietary: selectedItem.customDietary || "",
            pricingMode: selectedItem.menuType || "Per Person",
            basePrice: selectedItem.price?.replace(/[^0-9.]/g, "") || "",
            minimumGuests: selectedItem.minimumGuests || "",
            menuItems: selectedItem.menuItems?.length
              ? selectedItem.menuItems
              : initialCreateMenuItems,
            selectedAddOnIds: selectedItem.selectedAddOnIds || [],
            status: selectedItem.status?.toLowerCase() || "draft",
          }
        : getInitialMenuState();
    setMenuTitle(initialState.menuTitle);
    setDescription(initialState.description);
    setCategory(initialState.category);
    setMenuType(initialState.menuType);
    setCoverImage(initialState.coverImage || "");
    setGalleryImages(initialState.galleryImages || []);
    setSelectedDays(initialState.selectedDays || []);
    setLeadTime(initialState.leadTime || "24");
    setBlackoutDate(initialState.blackoutDate || "");
    setSelectedDietary(initialState.selectedDietary || []);
    setCustomDietary(initialState.customDietary || "");
    setPricingMode(initialState.pricingMode || "Per Person");
    setBasePrice(initialState.basePrice || "");
    setMinimumGuests(initialState.minimumGuests || "");
    setMenuItems(
      initialState.menuItems?.length ? initialState.menuItems : initialCreateMenuItems,
    );
    setAddOnSearch(initialState.addOnSearch || "");
    setSelectedAddOnIds(initialState.selectedAddOnIds || []);
  }, [isEditMode, isViewMode]);

  const allAddOns = useMemo(() => {
    const savedAddOnsRaw = window.localStorage.getItem("vendor-addon-items");
    if (savedAddOnsRaw) {
      return JSON.parse(savedAddOnsRaw);
    } else {
      window.localStorage.setItem("vendor-addon-items", JSON.stringify(optionalAddOns));
      return optionalAddOns;
    }
  }, []);

  const filteredAddOns = useMemo(
    () =>
      allAddOns.filter((item) => {
        const title = item.addOnName || item.name || "";
        return title.toLowerCase().includes(addOnSearch.trim().toLowerCase());
      }),
    [allAddOns, addOnSearch],
  );

  function toggleDay(day) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  }

  function toggleDietary(tag) {
    setSelectedDietary((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  function updateMenuItem(id, field, value) {
    setMenuItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  async function handleImageUpload(file, onSuccess) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      await showVendorErrorAlert("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      await showVendorErrorAlert("Please upload an image under 2MB.");
      return;
    }

    try {
      const imageData = await fileToDataUrl(file);
      onSuccess(imageData);
      await showVendorSuccessToast("Image uploaded.");
    } catch {
      await showVendorErrorAlert("Unable to process the selected image.");
    }
  }

  function addMenuItem() {
    setMenuItems((current) => [
      ...current,
      { id: Date.now(), title: "", allergen: "", image: "" },
    ]);
  }

  function removeMenuItem(id) {
    setMenuItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  }

  function toggleAddOn(id) {
    setSelectedAddOnIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function resetForm() {
    const nextState = getInitialMenuState();
    setMenuTitle(nextState.menuTitle);
    setDescription(nextState.description);
    setCategory(nextState.category);
    setMenuType(nextState.menuType);
    setCoverImage(nextState.coverImage);
    setGalleryImages(nextState.galleryImages);
    setSelectedDays(nextState.selectedDays);
    setLeadTime(nextState.leadTime);
    setBlackoutDate(nextState.blackoutDate);
    setSelectedDietary(nextState.selectedDietary);
    setCustomDietary(nextState.customDietary);
    setPricingMode(nextState.pricingMode);
    setBasePrice(nextState.basePrice);
    setMinimumGuests(nextState.minimumGuests);
    setMenuItems(nextState.menuItems);
    setAddOnSearch(nextState.addOnSearch);
    setSelectedAddOnIds(nextState.selectedAddOnIds);
  }

  function buildMenuPayload(status) {
    return {
      menuTitle,
      description,
      category,
      menuType,
      coverImage,
      galleryImages,
      selectedDays,
      leadTime,
      blackoutDate,
      selectedDietary,
      customDietary,
      pricingMode,
      basePrice,
      minimumGuests,
      menuItems,
      addOnSearch: "",
      selectedAddOnIds,
      status,
    };
  }

  function saveMenuToList(status) {
    const payload = buildMenuPayload(status);

    const savedMenusRaw = window.localStorage.getItem("vendor-menu-items");
    let currentMenus = savedMenusRaw ? JSON.parse(savedMenusRaw) : [];

    const selectedItemRaw = window.localStorage.getItem(MENU_SELECTED_ITEM_STORAGE_KEY);
    const selectedItem = selectedItemRaw ? JSON.parse(selectedItemRaw) : null;

    const menuId = (isEditMode || isViewMode) && selectedItem ? selectedItem.id : `menu-${Date.now()}`;

    const displayPrice = payload.basePrice.toString().startsWith("$")
      ? payload.basePrice
      : `$${payload.basePrice} per person`;

    const normalizedItem = {
      id: menuId,
      title: payload.menuTitle,
      description: payload.description,
      price: displayPrice,
      meta: `${payload.menuItems.length} menu items included`,
      image: payload.coverImage || "/heroBg.webp",
      status: status === "published" ? "Active" : "Draft",
      badge: payload.category || "Catering",
      tone: status === "published" ? "active" : "draft",

      category: payload.category,
      menuType: payload.menuType,
      coverImage: payload.coverImage,
      galleryImage: payload.galleryImages[0] || "",
      galleryImages: payload.galleryImages,
      selectedDays: payload.selectedDays,
      leadTime: payload.leadTime,
      blackoutDate: payload.blackoutDate,
      selectedDietary: payload.selectedDietary,
      customDietary: payload.customDietary,
      minimumGuests: payload.minimumGuests,
      menuItems: payload.menuItems,
      selectedAddOnIds: payload.selectedAddOnIds,
    };

    if (isEditMode || isViewMode) {
      currentMenus = currentMenus.map((item) => (item.id === menuId ? normalizedItem : item));
    } else {
      currentMenus = [normalizedItem, ...currentMenus];
    }

    window.localStorage.setItem("vendor-menu-items", JSON.stringify(currentMenus));
  }

  async function handleCancel() {
    window.localStorage.removeItem(MENU_SELECTED_ITEM_STORAGE_KEY);
    window.localStorage.removeItem(MENU_DRAFT_STORAGE_KEY);
    navigate("/menu");
  }

  async function handleSaveDraft() {
    if (!menuTitle.trim()) {
      await showVendorErrorAlert("Please enter a menu title before saving the draft.");
      return;
    }

    saveMenuToList("draft");
    window.localStorage.removeItem(MENU_SELECTED_ITEM_STORAGE_KEY);
    window.localStorage.removeItem(MENU_DRAFT_STORAGE_KEY);
    await showVendorSuccessToast("Menu saved as draft.");
    navigate("/menu");
  }

  async function handlePublish() {
    if (!menuTitle.trim() || !category || !menuType || !basePrice.trim()) {
      await showVendorErrorAlert(
        "Please complete the required menu details before publishing.",
      );
      return;
    }

    saveMenuToList("published");
    await showVendorSuccessToast("Menu published successfully.");
    window.localStorage.removeItem(MENU_SELECTED_ITEM_STORAGE_KEY);
    window.localStorage.removeItem(MENU_DRAFT_STORAGE_KEY);
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
          {isViewMode ? "View Menu" : isEditMode ? "Edit Menu" : "Create New Menu"}
        </h1>
        <p className="mt-1 text-[15px] font-medium text-[#746a62]">
          {isViewMode
            ? "Review this catering package and its configuration."
            : "Build and configure your bespoke catering package for potential clients."}
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1.48fr)_minmax(280px,0.96fr)] gap-4 max-[1120px]:grid-cols-1">
        <div className="flex flex-col gap-4">
          <CreateMenuBasicInfoSection
            category={category}
            categoryOptions={categoryOptions}
            coverImage={coverImage}
            description={description}
            disabled={isViewMode}
            galleryImages={galleryImages}
            menuTitle={menuTitle}
            menuType={menuType}
            menuTypeOptions={menuTypeOptions}
            onCategoryChange={(event) => setCategory(event.target.value)}
            onCoverImageSelect={(file) => handleImageUpload(file, setCoverImage)}
            onDescriptionChange={(event) => setDescription(event.target.value)}
            onGalleryImageSelect={(file) => handleImageUpload(file, (newImg) => setGalleryImages(prev => [...prev, newImg]))}
            onRemoveGalleryImage={(index) => setGalleryImages(prev => prev.filter((_, idx) => idx !== index))}
            onMenuTitleChange={(event) => setMenuTitle(event.target.value)}
            onMenuTypeChange={(event) => setMenuType(event.target.value)}
            onAddNewCategoryClick={() => setIsCategoryModalOpen(true)}
          />

          <CreateMenuPricingSection
            basePrice={basePrice}
            disabled={isViewMode}
            minimumGuests={minimumGuests}
            onBasePriceChange={(event) => setBasePrice(event.target.value)}
            onMinimumGuestsChange={(event) => setMinimumGuests(event.target.value)}
            pricingMode={pricingMode}
            pricingModes={pricingModes}
            setPricingMode={setPricingMode}
          />

          <CreateMenuItemsSection
            addMenuItem={addMenuItem}
            allergenOptions={allergenOptions}
            disabled={isViewMode}
            handleItemImageSelect={(id, file) =>
              handleImageUpload(file, (imageData) => updateMenuItem(id, "image", imageData))
            }
            menuItems={menuItems}
            onAddFromOtherPackage={() => setIsImportModalOpen(true)}
            removeMenuItem={removeMenuItem}
            updateMenuItem={updateMenuItem}
          />

          <CreateMenuAddOnsSection
            addOnSearch={addOnSearch}
            disabled={isViewMode}
            filteredAddOns={filteredAddOns}
            onSearchChange={(event) => setAddOnSearch(event.target.value)}
            selectedAddOnIds={selectedAddOnIds}
            toggleAddOn={toggleAddOn}
          />
        </div>

        <div className="flex flex-col gap-4">
          <CreateMenuAvailabilitySection
            availabilityDays={availabilityDays}
            blackoutDate={blackoutDate}
            customDietary={customDietary}
            disabled={isViewMode}
            dietaryOptions={dietaryOptions}
            leadTime={leadTime}
            leadTimeOptions={leadTimeOptions}
            onBlackoutDateChange={(event) => setBlackoutDate(event.target.value)}
            onCustomDietaryChange={(event) => setCustomDietary(event.target.value)}
            onLeadTimeChange={(event) => setLeadTime(event.target.value)}
            selectedDays={selectedDays}
            selectedDietary={selectedDietary}
            toggleDay={toggleDay}
            toggleDietary={toggleDietary}
          />
        </div>
      </div>

      <CreateMenuActionsBar
        hidePublish={isViewMode}
        onCancel={handleCancel}
        onPublish={handlePublish}
        onSaveDraft={isViewMode ? () => navigate("/menu") : handleSaveDraft}
        saveLabel={isViewMode ? "Back to Menus" : isEditMode ? "Save Changes" : "Save as Draft"}
      />

      <ImportMenuItemsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onAdd={handleAddImportedItems}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAdd={handleAddCategory}
        existingCategories={categoryOptions}
      />
    </section>
  );
}
