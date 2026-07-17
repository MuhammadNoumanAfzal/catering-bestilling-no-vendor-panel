import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  createAllergen,
  createFoodType,
  createOccasion,
  createVendorCategory,
  deleteVendorCategory,
  deleteFoodType,
  deleteOccasion,
  getVendorMenuDetail,
  getVendorMenuFormBootstrap,
  getVendorMenus,
  saveVendorMenu,
} from "../api/menuApi";
import {
  buildSaveVendorMenuVariables,
  mapAllergensToOptions,
  mapCategoriesToOptions,
  mapChoiceOptions,
  mapFoodTypesToOptions,
  mapOccasionsToOptions,
  mapMenuListResponse,
  mapVendorMenuDetailToForm,
  resolveMediaUrl,
} from "../api/menuMappers";
import { uploadMenuImage } from "../api/menuUploadApi";
import { allergenOptions as defaultAllergenOptions } from "../menuConstants";
import {
  createEmptyMenuItem,
  getInitialMenuState,
  toAddOnDisplay,
  toImportedMenuItem,
} from "../utils/menuEditorUtils";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const emptyFieldErrors = {
  menuTitle: "",
  category: "",
  menuTypes: "",
  selectedOccasions: "",
  basePrice: "",
  minimumGuests: "",
};

function mapMenuMutationErrors(errors = []) {
  const fieldMap = {
    name: "menuTitle",
    title: "menuTitle",
    category: "category",
    foodTypes: "menuTypes",
    occasions: "selectedOccasions",
    priceWithTax: "basePrice",
    minimumGuests: "minimumGuests",
  };

  return errors.reduce((accumulator, item) => {
    const targetField = fieldMap[item?.field] || item?.field;

    if (!targetField || !item?.message) {
      return accumulator;
    }

    accumulator[targetField] = accumulator[targetField]
      ? `${accumulator[targetField]} ${item.message}`
      : item.message;

    return accumulator;
  }, {});
}

export function useMenuEditor() {
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
  const [occasionOptions, setOccasionOptions] = useState([]);
  const [allergenOptions, setAllergenOptions] = useState(defaultAllergenOptions);
  const [pricingModes, setPricingModes] = useState([]);
  const [availableAddOns, setAvailableAddOns] = useState([]);
  const [existingMenus, setExistingMenus] = useState([]);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
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
        const nextOccasionOptions = mapOccasionsToOptions(bootstrapResult.occasions);
        const nextAllergenOptions = mapAllergensToOptions(bootstrapResult.allergens);
        const nextPricingModes = mapChoiceOptions(bootstrapResult.pricingTypeChoices);
        const nextAddOns = (bootstrapResult.vendorAddOns?.edges || [])
          .map((edge) => edge?.node)
          .filter(Boolean)
          .map(toAddOnDisplay);

        setCategoryOptions(nextCategoryOptions);
        setMenuTypeOptions(nextMenuTypeOptions);
        setOccasionOptions(nextOccasionOptions);
        setAllergenOptions(nextAllergenOptions);
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
          pricingMode: current.pricingMode || nextPricingModes[0]?.value || "",
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
    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));
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
        !current.menuItems[0].description &&
        !current.menuItems[0].allergens?.length &&
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
      description: item.description || "",
      image: item.imageUrl || "",
      allergens: item.allergens || [],
    }));
  }

  function validateBeforeSave() {
    if (!formState.menuTitle.trim()) {
      setFieldErrors((current) => ({
        ...current,
        menuTitle: "Please enter a menu title before saving.",
      }));
      return "Please enter a menu title before saving.";
    }

    if (!formState.category) {
      setFieldErrors((current) => ({
        ...current,
        category: "Please select a category for this menu.",
      }));
      return "Please select a category for this menu.";
    }

    if (!formState.menuTypes.length) {
      setFieldErrors((current) => ({
        ...current,
        menuTypes: "Please choose at least one food type.",
      }));
      return "Please choose at least one food type.";
    }

    if (pricingModes.length > 0 && !formState.pricingMode) {
      return "Please choose a pricing type.";
    }

    if (!String(formState.basePrice).trim()) {
      setFieldErrors((current) => ({
        ...current,
        basePrice: "Please enter a base price.",
      }));
      return "Please enter a base price.";
    }

    if (!String(formState.minimumGuests).trim()) {
      setFieldErrors((current) => ({
        ...current,
        minimumGuests: "Please enter the minimum guest count.",
      }));
      return "Please enter the minimum guest count.";
    }

    if (!formState.menuItems.some((item) => item.title.trim())) {
      return "Please add at least one menu item.";
    }

    return "";
  }

  async function handleSave(statusOverride) {
    setFieldErrors(emptyFieldErrors);
    const validationMessage = validateBeforeSave();

    if (validationMessage) {
      await showVendorErrorAlert(validationMessage);
      return;
    }

    try {
      setIsSaving(true);
      const variables = buildSaveVendorMenuVariables(formState, statusOverride);
      const result = await saveVendorMenu(variables);
      setFieldErrors(emptyFieldErrors);
      await showVendorSuccessToast(result.message || "Menu saved successfully.");
      navigate("/menu", { replace: true });
    } catch (error) {
      setFieldErrors((current) => ({
        ...current,
        ...mapMenuMutationErrors(error?.errors),
      }));
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

  function handleCancel() {
    navigate("/menu");
  }

  function handleAddNewCategoryClick() {
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

  async function handleEditCategory(id, newName) {
    const result = await createVendorCategory({ id, name: newName });
    const updatedOption = {
      label: result.instance?.name || newName,
      value: result.instance?.id || id,
    };

    setCategoryOptions((currentOptions) =>
      currentOptions.map((opt) => (opt.value === id ? updatedOption : opt)),
    );
    setFormState((current) => ({
      ...current,
      category: current.category === id ? updatedOption.value : current.category,
    }));
    await showVendorSuccessToast(result.message || "Category updated successfully.");
  }

  function handleAddMealTypeClick() {
    setField("isAddMealTypeModalOpen", true);
  }

  async function handleCreateMealType(mealTypeName) {
    const result = await createFoodType(mealTypeName);
    const nextOption = {
      label: result.instance?.name || mealTypeName,
      value: result.instance?.id || result.instance?.slug || mealTypeName,
    };

    setMenuTypeOptions((currentOptions) => [...currentOptions, nextOption]);
    setFormState((current) => ({
      ...current,
      menuTypes: current.menuTypes.includes(nextOption.value)
        ? current.menuTypes
        : [...current.menuTypes, nextOption.value],
      isAddMealTypeModalOpen: false,
    }));
    await showVendorSuccessToast(result.message || "Food type created.");
  }

  async function handleEditMealType(id, newName) {
    const result = await createFoodType({ id, name: newName });
    const updatedOption = {
      label: result.instance?.name || newName,
      value: result.instance?.id || result.instance?.slug || id,
    };

    setMenuTypeOptions((currentOptions) =>
      currentOptions.map((opt) => (opt.value === id ? updatedOption : opt)),
    );
    setFormState((current) => ({
      ...current,
      menuTypes: current.menuTypes.map((val) => (val === id ? updatedOption.value : val)),
    }));
    await showVendorSuccessToast(result.message || "Food type updated successfully.");
  }

  function handleAddOccasionClick() {
    setField("isAddOccasionModalOpen", true);
  }

  async function handleCreateOccasion(occasionName) {
    const result = await createOccasion(occasionName);
    const nextOption = {
      label: result.instance?.name || occasionName,
      value: result.instance?.id || result.instance?.slug || occasionName,
    };

    setOccasionOptions((currentOptions) => [...currentOptions, nextOption]);
    setFormState((current) => ({
      ...current,
      selectedOccasions: current.selectedOccasions.includes(nextOption.value)
        ? current.selectedOccasions
        : [...current.selectedOccasions, nextOption.value],
      isAddOccasionModalOpen: false,
    }));
    await showVendorSuccessToast(result.message || "Occasion created.");
  }

  async function handleEditOccasion(id, newName) {
    const result = await createOccasion({ id, name: newName });
    const updatedOption = {
      label: result.instance?.name || newName,
      value: result.instance?.id || result.instance?.slug || id,
    };

    setOccasionOptions((currentOptions) =>
      currentOptions.map((opt) => (opt.value === id ? updatedOption : opt)),
    );
    setFormState((current) => ({
      ...current,
      selectedOccasions: current.selectedOccasions.map((val) =>
        val === id ? updatedOption.value : val,
      ),
    }));
    await showVendorSuccessToast(result.message || "Occasion updated successfully.");
  }

  function handleAddAllergenClick() {
    setField("isAddAllergenModalOpen", true);
  }

  async function handleCreateAllergen(allergenName) {
    const result = await createAllergen(allergenName);
    const nextOption = {
      label: result.instance?.name || allergenName,
      value: result.instance?.id || result.instance?.slug || allergenName,
    };

    setAllergenOptions((currentOptions) => [...currentOptions, nextOption]);
    setField("isAddAllergenModalOpen", false);
    await showVendorSuccessToast(result.message || "Allergen created.");
  }

  async function handleEditAllergen(id, newName) {
    const result = await createAllergen({ id, name: newName });
    const updatedOption = {
      label: result.instance?.name || newName,
      value: result.instance?.id || result.instance?.slug || id,
    };

    setAllergenOptions((currentOptions) =>
      currentOptions.map((opt) => (opt.value === id ? updatedOption : opt)),
    );
    setFormState((current) => ({
      ...current,
      menuItems: current.menuItems.map((item) => ({
        ...item,
        allergens: (item.allergens || []).map((val) =>
          val === id ? updatedOption.value : val,
        ),
      })),
    }));
    await showVendorSuccessToast(result.message || "Allergen updated successfully.");
  }

  async function handleDeleteCategory(id) {
    const result = await deleteVendorCategory(id);
    setCategoryOptions((currentOptions) =>
      currentOptions.filter((opt) => opt.value !== id),
    );
    setFormState((current) => ({
      ...current,
      category: current.category === id ? "" : current.category,
    }));
    await showVendorSuccessToast(result.message || "Category deleted successfully.");
  }

  async function handleDeleteMealType(id) {
    const result = await deleteFoodType(id);
    setMenuTypeOptions((currentOptions) =>
      currentOptions.filter((opt) => opt.value !== id),
    );
    setFormState((current) => ({
      ...current,
      menuTypes: current.menuTypes.filter((val) => val !== id),
    }));
    await showVendorSuccessToast(result.message || "Food type deleted successfully.");
  }

  async function handleDeleteOccasion(id) {
    const result = await deleteOccasion(id);
    setOccasionOptions((currentOptions) =>
      currentOptions.filter((opt) => opt.value !== id),
    );
    setFormState((current) => ({
      ...current,
      selectedOccasions: current.selectedOccasions.filter((val) => val !== id),
    }));
    await showVendorSuccessToast(result.message || "Occasion deleted successfully.");
  }

  const menuItemsForDisplay = formState.menuItems.map((item) => ({
    ...item,
    image: resolveMediaUrl(item.image),
  }));

  return {
    categoryOptions,
    existingMenus,
    fieldErrors,
    allergenOptions,
    filteredAddOns,
    formState,
    isDuplicateMode,
    isEditMode,
    isLoading,
    isSaving,
    isViewMode,
    menuTypeOptions,
    mode,
    pricingModes,
    menuItemsForDisplay,
    occasionOptions,
    resolveMediaUrl,
    actions: {
      addMenuItem,
      handleAddAllergenClick,
      handleAddImportedItems,
      handleAddMealTypeClick,
      handleAddOccasionClick,
      handleAddNewCategoryClick,
      handleCancel,
      handleCreateAllergen,
      handleCreateCategory,
      handleCreateMealType,
      handleCreateOccasion,
      handleDeleteCategory,
      handleDeleteMealType,
      handleDeleteOccasion,
      handleEditAllergen,
      handleEditCategory,
      handleEditMealType,
      handleEditOccasion,
      handleImageUpload,
      handleImportMenuItemsRequest,
      handlePublish,
      handleSaveDraft,
      removeMenuItem,
      setField,
      setFormState,
      toggleAddOn,
      toggleDay,
      toggleDietary,
      updateMenuItem,
    },
  };
}
