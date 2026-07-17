import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  createFoodType,
  deleteFoodType,
  getVendorAddOnDetail,
  getVendorAddOnFormBootstrap,
  saveVendorAddOn,
} from "../api/menuApi";
import {
  buildSaveVendorAddOnVariables,
  mapCategoriesToOptions,
  mapFoodTypesToOptions,
  mapVendorAddOnDetailToForm,
  resolveMediaUrl,
} from "../api/menuMappers";
import { uploadMenuImage } from "../api/menuUploadApi";
import { getInitialAddOnState } from "../utils/addOnEditorUtils";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const emptyFieldErrors = {
  addOnName: "",
  price: "",
  category: "",
  mealTypes: "",
};

function mapAddOnMutationErrors(errors = []) {
  const fieldMap = {
    name: "addOnName",
    category: "category",
    priceWithTax: "price",
    foodTypes: "mealTypes",
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

export function useAddOnEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "create";
  const editId = searchParams.get("id");
  const isEditMode = mode === "edit";
  const isDuplicateMode = mode === "duplicate";

  const [formState, setFormState] = useState(getInitialAddOnState);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [mealTypeOptions, setMealTypeOptions] = useState([]);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadAddOnData() {
      setIsLoading(true);

      try {
        const [bootstrapResult, detailResult] = await Promise.all([
          getVendorAddOnFormBootstrap(),
          editId ? getVendorAddOnDetail(editId) : Promise.resolve(null),
        ]);

        if (isCancelled) {
          return;
        }

        const nextCategoryOptions = mapCategoriesToOptions(bootstrapResult.categories);
        const nextMealTypeOptions = mapFoodTypesToOptions(bootstrapResult.foodTypes);
        setCategoryOptions(nextCategoryOptions);
        setMealTypeOptions(nextMealTypeOptions);

        if (detailResult?.vendorAddOn) {
          const mappedDetail = mapVendorAddOnDetailToForm(detailResult.vendorAddOn);

          if (mappedDetail) {
            setFormState({
              ...getInitialAddOnState(),
              ...mappedDetail,
              id: isDuplicateMode ? "" : mappedDetail.id,
              addOnName: isDuplicateMode
                ? `${mappedDetail.addOnName} Copy`
                : mappedDetail.addOnName,
              availableImmediately: isDuplicateMode ? false : mappedDetail.availableImmediately,
              status: isDuplicateMode ? "draft" : mappedDetail.status,
            });
            return;
          }
        }

        setFormState((current) => ({
          ...current,
          category: current.category || nextCategoryOptions[0]?.value || "",
        }));
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load the add-on editor right now.",
            "Add-on data unavailable",
          );
          navigate("/menu", { replace: true });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAddOnData();

    return () => {
      isCancelled = true;
    };
  }, [editId, isDuplicateMode, navigate]);

  const resolvedCategory = useMemo(() => formState.category, [formState.category]);

  const selectedCategoryLabel = useMemo(() => {
    return categoryOptions.find((option) => option.value === formState.category)?.label || "";
  }, [categoryOptions, formState.category]);

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

  function resetForm() {
    setFieldErrors(emptyFieldErrors);
    setFormState({
      ...getInitialAddOnState(),
      category: categoryOptions[0]?.value || "",
    });
  }

  function toggleDietaryTag(tag) {
    setFormState((current) => ({
      ...current,
      selectedDietary: current.selectedDietary.includes(tag)
        ? current.selectedDietary.filter((item) => item !== tag)
        : [...current.selectedDietary, tag],
    }));
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
      const uploadedAsset = await uploadMenuImage(file);
      setField("image", uploadedAsset);
      await showVendorSuccessToast("Product image uploaded.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to process the selected image.");
    }
  }

  async function validateAddOn() {
    if (!formState.addOnName.trim()) {
      setFieldErrors((current) => ({
        ...current,
        addOnName: "Please enter an add-on name.",
      }));
      await showVendorErrorAlert("Please enter an add-on name.");
      return false;
    }

    if (!String(formState.price).trim()) {
      setFieldErrors((current) => ({
        ...current,
        price: "Please enter a price for this add-on.",
      }));
      await showVendorErrorAlert("Please enter a price for this add-on.");
      return false;
    }

    if (!resolvedCategory) {
      setFieldErrors((current) => ({
        ...current,
        category: "Please choose a category.",
      }));
      await showVendorErrorAlert("Please choose a category.");
      return false;
    }

    return true;
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

    setMealTypeOptions((currentOptions) => [...currentOptions, nextOption]);
    setFormState((current) => ({
      ...current,
      mealTypes: current.mealTypes.includes(nextOption.value)
        ? current.mealTypes
        : [...current.mealTypes, nextOption.value],
      isAddMealTypeModalOpen: false,
    }));
    await showVendorSuccessToast(result.message || "Meal type created.");
  }

  async function handleEditMealType(id, newName) {
    const result = await createFoodType({ id, name: newName });
    const updatedOption = {
      label: result.instance?.name || newName,
      value: result.instance?.id || result.instance?.slug || id,
    };

    setMealTypeOptions((currentOptions) =>
      currentOptions.map((opt) => (opt.value === id ? updatedOption : opt)),
    );
    setFormState((current) => ({
      ...current,
      mealTypes: current.mealTypes.map((val) => (val === id ? updatedOption.value : val)),
    }));
    await showVendorSuccessToast(result.message || "Meal type updated successfully.");
  }

  async function handleDeleteMealType(id) {
    const result = await deleteFoodType(id);
    setMealTypeOptions((currentOptions) =>
      currentOptions.filter((opt) => opt.value !== id),
    );
    setFormState((current) => ({
      ...current,
      mealTypes: current.mealTypes.filter((val) => val !== id),
    }));
    await showVendorSuccessToast(result.message || "Meal type deleted successfully.");
  }

  async function saveCurrentAddOn({ navigateAfterSave }) {
    setFieldErrors(emptyFieldErrors);
    const isValid = await validateAddOn();

    if (!isValid) {
      return;
    }

    const resolvedCategoryId = formState.category;

    try {
      setIsSaving(true);
      const variables = buildSaveVendorAddOnVariables(
        {
          ...formState,
          category: resolvedCategoryId,
        },
        { categoryId: resolvedCategoryId },
      );
      const result = await saveVendorAddOn(variables);
      setFieldErrors(emptyFieldErrors);

      await showVendorSuccessToast(
        result.message || (navigateAfterSave ? "Add-on saved successfully." : "Add-on added."),
      );

      if (navigateAfterSave) {
        navigate("/menu", { replace: true });
        return;
      }

      resetForm();
    } catch (error) {
      setFieldErrors((current) => ({
        ...current,
        ...mapAddOnMutationErrors(error?.errors),
      }));
      await showVendorErrorAlert(error.message || "Unable to save the add-on right now.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddAnother() {
    await saveCurrentAddOn({ navigateAfterSave: false });
  }

  async function handleSave() {
    await saveCurrentAddOn({ navigateAfterSave: true });
  }

  function handleCancel() {
    navigate("/menu");
  }

  return {
    categoryOptions,
    fieldErrors,
    formState,
    imageUrl: resolveMediaUrl(formState.image),
    isDuplicateMode,
    isEditMode,
    isLoading,
    isSaving,
    mealTypeOptions,
    resolvedCategory,
    selectedCategoryLabel,
    actions: {
      handleAddAnother,
      handleAddMealTypeClick,
      handleCancel,
      handleCreateMealType,
      handleDeleteMealType,
      handleEditMealType,
      handleImageUpload,
      handleSave,
      setField,
      toggleDietaryTag,
    },
  };
}
