import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CreateAddOnActionsBar from "../components/create-addon/CreateAddOnActionsBar";
import CreateAddOnAvailabilitySection from "../components/create-addon/CreateAddOnAvailabilitySection";
import CreateAddOnBasicInfoSection from "../components/create-addon/CreateAddOnBasicInfoSection";
import AddOnTypeSection from "../components/create-addon/AddOnTypeSection";
import { useAddOnEditor } from "../hooks/useAddOnEditor";
import VendorPageLoadingState from "../../../components/shared/VendorPageLoadingState";

export default function CreateAddOnPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    fieldErrors,
    formState,
    imageUrl,
    isDuplicateMode,
    isEditMode,
    isLoading,
    isSaving,
    dietaryOptions,
    allergenOptions,
    mealTypeOptions,
    actions,
  } = useAddOnEditor();

  if (isLoading) {
    return <VendorPageLoadingState variant="form" />;
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col bg-white px-4 pt-5 sm:px-7 sm:pt-6">
      <header className="mb-6">
        <button
          className="mb-3 inline-flex cursor-pointer items-center gap-1 text-[12px] font-medium text-[#737f8b] transition hover:text-[#23745d]"
          onClick={() => navigate("/menu")}
          type="button"
        >
          <ChevronLeft size={16} />
          {t("menu.backToManagement", { defaultValue: "Menu management" })}
        </button>
        <h1 className="m-0 text-[26px] font-semibold leading-tight text-[#202a34]">
          {isEditMode ? t("menu.editAddOnTitle", { defaultValue: "Edit Add-on" }) : isDuplicateMode ? t("menu.duplicateAddOnTitle", { defaultValue: "Duplicate Add-on" }) : t("menu.addOnTitle", { defaultValue: "Add New Add-on" })}
        </h1>
      </header>

      <div className="[&_input:not([type=checkbox]):not([type=radio])]:border-[#dce1e6] [&_textarea]:border-[#dce1e6] [&_textarea]:bg-white">
        <AddOnTypeSection form={formState} onChange={actions.setField} disabled={isSaving} allergenOptions={allergenOptions} />
        <CreateAddOnBasicInfoSection
          isStandalone={formState.addOnType === "INDEPENDENT"}
          addOnName={formState.addOnName}
          description={formState.description}
          disabled={isSaving}
          fieldErrors={fieldErrors}
          image={imageUrl}
          mealTypeOptions={mealTypeOptions}
          mealTypes={formState.mealTypes}
          onAddOnNameChange={(event) => actions.setField("addOnName", event.target.value)}
          onDescriptionChange={(event) => actions.setField("description", event.target.value)}
          onImageSelect={actions.handleImageUpload}
          onMealTypesChange={(value) => actions.setField("mealTypes", value)}
          onPriceChange={(event) => actions.setField("price", event.target.value)}
          price={formState.price}
        />
        <div>
          <CreateAddOnAvailabilitySection
            availableImmediately={formState.availableImmediately}
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
        disabled={isSaving}
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


