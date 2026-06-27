import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CreateMenuActionsBar from "../components/create-menu/CreateMenuActionsBar";
import AddCategoryModal from "../components/create-menu/AddCategoryModal";
import CreateMenuAddOnsSection from "../components/create-menu/CreateMenuAddOnsSection";
import CreateMenuAvailabilitySection from "../components/create-menu/CreateMenuAvailabilitySection";
import CreateMenuBasicInfoSection from "../components/create-menu/CreateMenuBasicInfoSection";
import CreateMenuItemsSection from "../components/create-menu/CreateMenuItemsSection";
import CreateMenuPricingSection from "../components/create-menu/CreateMenuPricingSection";
import ImportMenuItemsModal from "../components/create-menu/ImportMenuItemsModal";
import {
  createVendorCategory,
  getVendorMenuDetail,
  getVendorMenuFormBootstrap,
  getVendorMenus,
  saveVendorMenu,
} from "../api/menuApi";
import {
  buildSaveVendorMenuVariables,
  mapCategoriesToOptions,
  mapChoiceOptions,
  mapFoodTypesToOptions,
  mapMenuListResponse,
  mapVendorMenuDetailToForm,
  resolveMediaUrl,
} from "../api/menuMappers";
import { uploadMenuImage } from "../api/menuUploadApi";
import {
  allergenOptions,
  availabilityDays,
  dietaryOptions,
  initialCreateMenuItems,
  leadTimeOptions,
} from "../menuConstants";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

function createEmptyMenuItem() {
  return {
    id: `draft-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    allergen: "",
    image: null,
  };
}

function getInitialMenuState() {
  return {
    id: "",
    menuTitle: "",
    description: "",
    category: "",
    productType: "",
    menuType: "",
    coverImage: null,
    galleryImages: [],
    selectedDays: [],
    leadTime: "24",
    blackoutDate: "",
    selectedDietary: [],
    customDietary: "",
    pricingMode: "",
    basePrice: "",
    minimumGuests: "",
    menuItems: initialCreateMenuItems.map((item) => ({ ...item })),
    addOnSearch: "",
    selectedAddOnIds: [],
    status: "draft",
    hasAvailabilityWindow: false,
    availabilityStart: "",
    availabilityEnd: "",
    isImportModalOpen: false,
    isAddCategoryModalOpen: false,
  };
}

function toAddOnDisplay(addOn) {
  return {
    ...addOn,
    image: addOn.coverImage?.fileUrl || addOn.image || "/heroBg.webp",
    price: addOn.priceWithTax || addOn.price || "",
  };
}

function toImportedMenuItem(item, index) {
  return {
    id: `imported-item-${Date.now()}-${index}`,
    title: item.title || "",
    allergen: Array.isArray(item.allergens) ? item.allergens[0] || "" : "",
    image: item.imageUrl
      ? {
          fileId: item.fileId || "",
          fileUrl: item.imageUrl,
        }
      : null,
  };
}

export default function CreateMenuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "create";
  const menuId = searchParams.get("id") || "";
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isDuplicateMode = mode === "duplicate";

  const [formState, setFormState] = useState(getInitialMenuState);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [menuTypeOptions, setMenuTypeOptions] = useState([]);
  const [pricingModes, setPricingModes] = useState([]);
  const [availableAddOns, setAvailableAddOns] = useState([]);
  const [existingMenus, setExistingMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadPageData() {
      setIsLoading(true);

      try {
        const [bootstrapResult, menusResult, detailResult] = await Promise.all([
          getVendorMenuFormBootstrap(),
          getVendorMenus(),
          menuId ? getVendorMenuDetail(menuId) : Promise.resolve(null),
        ]);

        if (isCancelled) {
          return;
        }

        const nextCategoryOptions = mapCategoriesToOptions(bootstrapResult.categories);
        const nextProductTypeOptions = mapChoiceOptions(bootstrapResult.productTypeChoices);
        const nextMenuTypeOptions = mapFoodTypesToOptions(bootstrapResult.foodTypes);
        const nextPricingModes = mapChoiceOptions(bootstrapResult.pricingTypeChoices);
        const nextAddOns = (bootstrapResult.vendorAddOns?.edges || [])
          .map((edge) => edge?.node)
          .filter(Boolean)
          .map(toAddOnDisplay);

        setCategoryOptions(nextCategoryOptions);
        setMenuTypeOptions(nextMenuTypeOptions);
        setPricingModes(nextPricingModes);
        setAvailableAddOns(nextAddOns);
        setExistingMenus(mapMenuListResponse(menusResult));

        if (detailResult?.vendorMenu) {
          const mappedDetail = mapVendorMenuDetailToForm(detailResult.vendorMenu);

          if (mappedDetail) {
            setFormState({
              ...getInitialMenuState(),
              ...mappedDetail,
              productType:
                mappedDetail.productType ||
                nextProductTypeOptions.find((option) => option.value === "menu")?.value ||
                nextProductTypeOptions[0]?.value ||
                "",
              id: isDuplicateMode ? "" : mappedDetail.id,
              menuTitle: isDuplicateMode
                ? `${mappedDetail.menuTitle} Copy`
                : mappedDetail.menuTitle,
              status: isDuplicateMode ? "draft" : mappedDetail.status,
            });
            return;
          }
        }

        setFormState((current) => ({
          ...current,
          productType:
            current.productType ||
            nextProductTypeOptions.find((option) => option.value === "menu")?.value ||
            nextProductTypeOptions[0]?.value ||
            "",
          menuType:
            current.menuType ||
            nextMenuTypeOptions[0]?.value ||
            "",
          pricingMode:
            current.pricingMode ||
            nextPricingModes[0]?.value ||
            "",
        }));
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load the menu editor right now.",
            "Menu data unavailable",
          );
          navigate("/menu", { replace: true });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      isCancelled = true;
    };
  }, [isDuplicateMode, menuId, navigate]);

  const filteredAddOns = useMemo(() => {
    const searchValue = formState.addOnSearch.trim().toLowerCase();

    if (!searchValue) {
      return availableAddOns;
    }

    return availableAddOns.filter((item) => {
      const title = item.name || "";
      const categoryName = item.category?.name || "";
      return (
        title.toLowerCase().includes(searchValue) ||
        categoryName.toLowerCase().includes(searchValue)
      );
    });
  }, [availableAddOns, formState.addOnSearch]);

  function setField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleDay(dayValue) {
    setFormState((current) => ({
      ...current,
      selectedDays: current.selectedDays.includes(dayValue)
        ? current.selectedDays.filter((item) => item !== dayValue)
        : [...current.selectedDays, dayValue],
    }));
  }

  function toggleDietary(tag) {
    setFormState((current) => ({
      ...current,
      selectedDietary: current.selectedDietary.includes(tag)
        ? current.selectedDietary.filter((item) => item !== tag)
        : [...current.selectedDietary, tag],
    }));
  }

  function updateMenuItem(id, field, value) {
    setFormState((current) => ({
      ...current,
      menuItems: current.menuItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addMenuItem() {
    setFormState((current) => ({
      ...current,
      menuItems: [...current.menuItems, createEmptyMenuItem()],
    }));
  }

  function removeMenuItem(id) {
    setFormState((current) => ({
      ...current,
      menuItems:
        current.menuItems.length === 1
          ? current.menuItems
          : current.menuItems.filter((item) => item.id !== id),
    }));
  }

  function toggleAddOn(id) {
    setFormState((current) => ({
      ...current,
      selectedAddOnIds: current.selectedAddOnIds.includes(id)
        ? current.selectedAddOnIds.filter((item) => item !== id)
        : [...current.selectedAddOnIds, id],
    }));
  }

  function handleAddImportedItems(selectedItemsList) {
    const normalizedItems = selectedItemsList.map(toImportedMenuItem);

    setFormState((current) => {
      const isSingleEmpty =
        current.menuItems.length === 1 &&
        !current.menuItems[0].title &&
        !current.menuItems[0].allergen &&
        !current.menuItems[0].image;

      return {
        ...current,
        menuItems: isSingleEmpty
          ? normalizedItems
          : [...current.menuItems, ...normalizedItems],
      };
    });
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
      const uploadedAsset = await uploadMenuImage(file);
      onSuccess(uploadedAsset);
      await showVendorSuccessToast("Image uploaded.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to upload the selected image.");
    }
  }

  async function handleImportMenuItemsRequest(targetMenuId) {
    const result = await getVendorMenuDetail(targetMenuId);
    const menuItems = result?.vendorMenu?.menuItems || [];

    return menuItems.map((item) => ({
      id: item.id,
      title: item.title || "",
      image: item.imageUrl || "",
      allergens: item.allergens || [],
    }));
  }

  function validateBeforeSave() {
    if (!formState.menuTitle.trim()) {
      return "Please enter a menu title before saving.";
    }

    if (!formState.category) {
      return "Please select a category for this menu.";
    }

    if (!formState.menuType) {
      return "Please choose a meal type.";
    }

    if (!formState.pricingMode) {
      return "Please choose a pricing type.";
    }

    if (!String(formState.basePrice).trim()) {
      return "Please enter a base price.";
    }

    if (!String(formState.minimumGuests).trim()) {
      return "Please enter the minimum guest count.";
    }

    if (!formState.menuItems.some((item) => item.title.trim())) {
      return "Please add at least one menu item.";
    }

    return "";
  }

  async function handleSave(statusOverride) {
    const validationMessage = validateBeforeSave();

    if (validationMessage) {
      await showVendorErrorAlert(validationMessage);
      return;
    }

    try {
      setIsSaving(true);
      const variables = buildSaveVendorMenuVariables(formState, statusOverride);
      const result = await saveVendorMenu(variables);
      await showVendorSuccessToast(result.message || "Menu saved successfully.");
      navigate("/menu", { replace: true });
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to save the menu right now.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveDraft() {
    const draftStatus = isEditMode && formState.status ? formState.status : "draft";
    await handleSave(draftStatus);
  }

  async function handlePublish() {
    await handleSave("active");
  }

  async function handleCancel() {
    navigate("/menu");
  }

  async function handleAddNewCategoryClick() {
    setField("isAddCategoryModalOpen", true);
  }

  async function handleCreateCategory(categoryName) {
    const result = await createVendorCategory(categoryName);
    const nextOption = {
      label: result.instance?.name || categoryName,
      value: result.instance?.id || categoryName,
    };

    setCategoryOptions((currentOptions) => [...currentOptions, nextOption]);
    setFormState((current) => ({
      ...current,
      category: nextOption.value,
      isAddCategoryModalOpen: false,
    }));
    await showVendorSuccessToast(result.message || "Category created.");
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[calc(100vh-124px)] flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-[#e8ded4]" />
        <div className="h-16 animate-pulse rounded-[18px] bg-[#efe5dc]" />
        <div className="grid grid-cols-[minmax(0,1.48fr)_minmax(280px,0.96fr)] gap-4 max-[1120px]:grid-cols-1">
          <div className="space-y-4">
            <div className="h-72 animate-pulse rounded-[18px] bg-[#f3ece5]" />
            <div className="h-48 animate-pulse rounded-[18px] bg-[#f3ece5]" />
            <div className="h-64 animate-pulse rounded-[18px] bg-[#f3ece5]" />
          </div>
          <div className="h-72 animate-pulse rounded-[18px] bg-[#f3ece5]" />
        </div>
      </section>
    );
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
          {isViewMode
            ? "View Menu"
            : isEditMode
              ? "Edit Menu"
              : isDuplicateMode
                ? "Duplicate Menu"
                : "Create New Menu"}
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
            category={formState.category}
            categoryOptions={categoryOptions}
            coverImage={resolveMediaUrl(formState.coverImage)}
            description={formState.description}
            disabled={isViewMode || isSaving}
            galleryImages={formState.galleryImages.map(resolveMediaUrl)}
            menuTitle={formState.menuTitle}
            menuType={formState.menuType}
            menuTypeOptions={menuTypeOptions}
            onCategoryChange={(event) => setField("category", event.target.value)}
            onCoverImageSelect={(file) => handleImageUpload(file, (asset) => setField("coverImage", asset))}
            onDescriptionChange={(event) => setField("description", event.target.value)}
            onGalleryImageSelect={(file) =>
              handleImageUpload(file, (asset) =>
                setFormState((current) => ({
                  ...current,
                  galleryImages: [...current.galleryImages, asset],
                })),
              )
            }
            onRemoveGalleryImage={(index) =>
              setFormState((current) => ({
                ...current,
                galleryImages: current.galleryImages.filter((_, idx) => idx !== index),
              }))
            }
            onMenuTitleChange={(event) => setField("menuTitle", event.target.value)}
            onMenuTypeChange={(event) => setField("menuType", event.target.value)}
            onAddNewCategoryClick={handleAddNewCategoryClick}
          />

          <CreateMenuPricingSection
            basePrice={formState.basePrice}
            disabled={isViewMode || isSaving}
            minimumGuests={formState.minimumGuests}
            onBasePriceChange={(event) => setField("basePrice", event.target.value)}
            onMinimumGuestsChange={(event) => setField("minimumGuests", event.target.value)}
            pricingMode={formState.pricingMode}
            pricingModes={pricingModes}
            setPricingMode={(value) => setField("pricingMode", value)}
          />

          <CreateMenuItemsSection
            addMenuItem={addMenuItem}
            allergenOptions={allergenOptions}
            disabled={isViewMode || isSaving}
            handleItemImageSelect={(id, file) =>
              handleImageUpload(file, (asset) => updateMenuItem(id, "image", asset))
            }
            menuItems={formState.menuItems.map((item) => ({
              ...item,
              image: resolveMediaUrl(item.image),
            }))}
            onAddFromOtherPackage={() => setField("isImportModalOpen", true)}
            removeMenuItem={removeMenuItem}
            updateMenuItem={updateMenuItem}
          />

          <CreateMenuAddOnsSection
            addOnSearch={formState.addOnSearch}
            disabled={isViewMode || isSaving}
            filteredAddOns={filteredAddOns}
            onSearchChange={(event) => setField("addOnSearch", event.target.value)}
            selectedAddOnIds={formState.selectedAddOnIds}
            toggleAddOn={toggleAddOn}
          />
        </div>

        <div className="flex flex-col gap-4">
          <CreateMenuAvailabilitySection
            availabilityDays={availabilityDays}
            disabled={isViewMode || isSaving}
            dietaryOptions={dietaryOptions}
            leadTime={formState.leadTime}
            leadTimeOptions={leadTimeOptions}
            onLeadTimeChange={(event) => setField("leadTime", event.target.value)}
            selectedDays={formState.selectedDays}
            selectedDietary={formState.selectedDietary}
            toggleDay={toggleDay}
            toggleDietary={toggleDietary}
            hasAvailabilityWindow={formState.hasAvailabilityWindow}
            onHasAvailabilityWindowChange={(value) => setField("hasAvailabilityWindow", value)}
            availabilityStart={formState.availabilityStart}
            onAvailabilityStartChange={(event) => setField("availabilityStart", event.target.value)}
            availabilityEnd={formState.availabilityEnd}
            onAvailabilityEndChange={(event) => setField("availabilityEnd", event.target.value)}
          />

          {!isViewMode ? (
            <div className="rounded-[18px] border border-[#e7dbd1] bg-[#fffaf6] px-4 py-4 shadow-[0_10px_24px_rgba(67,40,22,0.05)]">
              <p className="m-0 text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#a06d4e]">
                API Ready
              </p>
              <p className="mt-2 text-[13px] font-medium leading-[1.55] text-[#6e6259]">
                Categories, meal types, pricing modes, add-ons, menu details, and saves are now loaded from the vendor menu API.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <CreateMenuActionsBar
        hidePublish={isViewMode}
        onCancel={handleCancel}
        onPublish={handlePublish}
        onSaveDraft={isViewMode ? () => navigate("/menu") : handleSaveDraft}
        saveLabel={
          isViewMode
            ? "Back to Menus"
            : isEditMode
              ? "Save Changes"
              : isDuplicateMode
                ? "Save Copy as Draft"
                : "Save as Draft"
        }
      />

      <ImportMenuItemsModal
        existingMenus={existingMenus.filter((menu) => menu.id !== formState.id)}
        isOpen={Boolean(formState.isImportModalOpen)}
        onAdd={handleAddImportedItems}
        onClose={() => setField("isImportModalOpen", false)}
        onRequestMenuItems={handleImportMenuItemsRequest}
      />

      <AddCategoryModal
        existingCategories={categoryOptions.map((option) => option.label)}
        isOpen={Boolean(formState.isAddCategoryModalOpen)}
        onAdd={handleCreateCategory}
        onClose={() => setField("isAddCategoryModalOpen", false)}
      />
    </section>
  );
}
