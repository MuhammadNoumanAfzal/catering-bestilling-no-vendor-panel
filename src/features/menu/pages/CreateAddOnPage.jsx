import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CreateAddOnActionsBar from "../components/create-addon/CreateAddOnActionsBar";
import CreateAddOnAvailabilitySection from "../components/create-addon/CreateAddOnAvailabilitySection";
import CreateAddOnBasicInfoSection from "../components/create-addon/CreateAddOnBasicInfoSection";
import { useAddOnEditor } from "../hooks/useAddOnEditor";

export default function CreateAddOnPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    categoryOptions,
    fieldErrors,
    formState,
    imageUrl,
    isDuplicateMode,
    isEditMode,
    isLoading,
    isSaving,
    dietaryOptions,
    mealTypeOptions,
    resolvedCategories,
    selectedCategoryLabels,
    actions,
  } = useAddOnEditor();

  if (isLoading) {
    return (
      <section className="flex min-h-[calc(100vh-124px)] flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded bg-[#e8ded4]" />
        <div className="h-16 animate-pulse rounded-[18px] bg-[#efe5dc]" />
        <div className="h-72 animate-pulse rounded-[18px] bg-[#f3ece5]" />
        <div className="h-56 animate-pulse rounded-[18px] bg-[#f3ece5]" />
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
          {t("menu.backToManagement", { defaultValue: "Menu management" })}
        </button>
        <h1 className="type-h2 m-0 text-[#15110f]">
          {isEditMode ? t("menu.editAddOnTitle", { defaultValue: "Edit Add-on" }) : isDuplicateMode ? t("menu.duplicateAddOnTitle", { defaultValue: "Duplicate Add-on" }) : t("menu.addOnTitle", { defaultValue: "Add New Add-on" })}
        </h1>
        <p className="mt-1 text-[15px] font-medium text-[#746a62]">
          {isEditMode
            ? t("menu.editAddOnDescription", { defaultValue: "Update the details and configuration of your add-on item." })
            : t("menu.addOnDescription", { defaultValue: "Create a new extra item for your customers to customize their meals." })}
        </p>
      </header>

      <div className="space-y-4">
        <CreateAddOnBasicInfoSection
          addOnName={formState.addOnName}
          categories={formState.categories}
          categoryOptions={categoryOptions}
          description={formState.description}
          disabled={isSaving}
          fieldErrors={fieldErrors}
          image={imageUrl}
          mealTypeOptions={mealTypeOptions}
          mealTypes={formState.mealTypes}
          onAddOnNameChange={(event) => actions.setField("addOnName", event.target.value)}
          onCategoryToggle={actions.toggleCategory}
          onDescriptionChange={(event) => actions.setField("description", event.target.value)}
          onImageSelect={actions.handleImageUpload}
          onMealTypesChange={(value) => actions.setField("mealTypes", value)}
          onPriceChange={(event) => actions.setField("price", event.target.value)}
          price={formState.price}
        />
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 max-[980px]:grid-cols-1">
          <CreateAddOnAvailabilitySection
            availableImmediately={formState.availableImmediately}
            customCategory={
              selectedCategoryLabels.join(", ") ||
              resolvedCategories.join(", ")
            }
            disabled={isSaving}
            dietaryOptions={dietaryOptions}
            onAvailabilityToggle={(value) => {
              if (typeof value === "string") {
                actions.toggleDietaryTag(value);
                return;
              }

              actions.setField("availableImmediately", !formState.availableImmediately);
            }}
            selectedDietary={formState.selectedDietary}
          />
        </div>
      </div>

      <CreateAddOnActionsBar
        onCancel={actions.handleCancel}
        onPrimaryAction={actions.handleAddAnother}
        onSave={actions.handleSave}
        isEditMode={isEditMode}
        primaryLabel={t("menu.addAnother", { defaultValue: "+ Add Another Item" })}
        saveLabel={isEditMode ? t("menu.saveChanges", { defaultValue: "Save Changes" }) : isDuplicateMode ? t("menu.saveCopy", { defaultValue: "Save Copy" }) : t("menu.saveAddOn", { defaultValue: "Save Add-on" })}
      />
    </section>
  );
}
