import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CreateMenuActionsBar from "../components/create-menu/CreateMenuActionsBar";
import CreateMenuAddOnsSection from "../components/create-menu/CreateMenuAddOnsSection";
import CreateMenuAvailabilitySection from "../components/create-menu/CreateMenuAvailabilitySection";
import CreateMenuBasicInfoSection from "../components/create-menu/CreateMenuBasicInfoSection";
import CreateMenuItemsSection from "../components/create-menu/CreateMenuItemsSection";
import CreateMenuPricingSection from "../components/create-menu/CreateMenuPricingSection";
import ImportMenuItemsModal from "../components/create-menu/ImportMenuItemsModal";
import { useMenuEditor } from "../hooks/useMenuEditor";

export default function CreateMenuPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    allergenOptions,
    categoryOptions,
    dietaryOptions,
    existingMenus,
    fieldErrors,
    filteredAddOns,
    formState,
    isDuplicateMode,
    isEditMode,
    isLoading,
    isSaving,
    isViewMode,
    menuItemErrors,
    menuItemsForDisplay,
    menuTypeOptions,
    occasionOptions,
    pricingModes,
    resolveMediaUrl,
    actions,
  } = useMenuEditor();

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
          {t("menu.backToManagement", { defaultValue: "Menu management" })}
        </button>
        <h1 className="type-h2 m-0 text-[#15110f]">
          {isViewMode
            ? t("menu.viewTitle", { defaultValue: "View Menu" })
            : isEditMode
              ? t("menu.editTitle", { defaultValue: "Edit Menu" })
              : isDuplicateMode
                ? t("menu.duplicateTitle", { defaultValue: "Duplicate Menu" })
                : t("menu.createTitle", { defaultValue: "Create New Menu" })}
        </h1>
        <p className="mt-1 text-[15px] font-medium text-[#746a62]">
          {isViewMode
            ? t("menu.viewDescription", { defaultValue: "Review this catering package and its configuration." })
            : t("menu.createDescription", { defaultValue: "Build and configure your bespoke catering package for potential clients." })}
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
            fieldErrors={fieldErrors}
            galleryImages={formState.galleryImages.map(resolveMediaUrl)}
            menuTitle={formState.menuTitle}
            menuTypes={formState.menuTypes}
            menuTypeOptions={menuTypeOptions}
            occasionOptions={occasionOptions}
            selectedOccasions={formState.selectedOccasions}
            onCategoryChange={(event) => actions.setField("category", event.target.value)}
            onCoverImageSelect={(file) =>
              actions.handleImageUpload(file, (asset) => actions.setField("coverImage", asset))
            }
            onDescriptionChange={(event) => actions.setField("description", event.target.value)}
            onGalleryImageSelect={(file) =>
              actions.handleImageUpload(file, (asset) =>
                actions.setFormState((current) => ({
                  ...current,
                  galleryImages: [...current.galleryImages, asset],
                })),
              )
            }
            onRemoveGalleryImage={(index) =>
              actions.setFormState((current) => ({
                ...current,
                galleryImages: current.galleryImages.filter((_, idx) => idx !== index),
              }))
            }
            onMenuTitleChange={(event) => actions.setField("menuTitle", event.target.value)}
            onMenuTypesChange={(value) => actions.setField("menuTypes", value)}
            onOccasionsChange={(value) => actions.setField("selectedOccasions", value)}
          />

          <CreateMenuPricingSection
            basePrice={formState.basePrice}
            disabled={isViewMode || isSaving}
            fieldErrors={fieldErrors}
            minimumGuests={formState.minimumGuests}
            onBasePriceChange={(event) => actions.setField("basePrice", event.target.value)}
            onMinimumGuestsChange={(event) =>
              actions.setField("minimumGuests", event.target.value)
            }
            pricingMode={formState.pricingMode}
            pricingModes={pricingModes}
            setPricingMode={(value) => actions.setField("pricingMode", value)}
          />

          <CreateMenuItemsSection
            addMenuItem={actions.addMenuItem}
            allergenOptions={allergenOptions}
            disabled={isViewMode || isSaving}
            handleItemImageSelect={(id, file) =>
              actions.handleImageUpload(file, (asset) => actions.updateMenuItem(id, "image", asset))
            }
            menuItemErrors={menuItemErrors}
            menuItems={menuItemsForDisplay}
            onAddFromOtherPackage={() => actions.setField("isImportModalOpen", true)}
            removeMenuItem={actions.removeMenuItem}
            saveMenuItem={actions.saveMenuItem}
            toggleMenuItemExpanded={actions.toggleMenuItemExpanded}
            updateMenuItem={actions.updateMenuItem}
          />

          <CreateMenuAddOnsSection
            addOnSearch={formState.addOnSearch}
            disabled={isViewMode || isSaving}
            filteredAddOns={filteredAddOns}
            onSearchChange={(event) => actions.setField("addOnSearch", event.target.value)}
            selectedAddOnIds={formState.selectedAddOnIds}
            toggleAddOn={actions.toggleAddOn}
          />
        </div>

        <div className="flex flex-col gap-4">
          <CreateMenuAvailabilitySection
            disabled={isViewMode || isSaving}
            dietaryOptions={dietaryOptions}
            selectedDietary={formState.selectedDietary}
            toggleDietary={actions.toggleDietary}
          />


        </div>
      </div>

      <CreateMenuActionsBar
        hidePublish={isViewMode}
        onCancel={actions.handleCancel}
        onPublish={actions.handlePublish}
        onSaveDraft={isViewMode ? () => navigate("/menu") : actions.handleSaveDraft}
        saveLabel={
          isViewMode
            ? t("menu.backToMenus", { defaultValue: "Back to Menus" })
            : isEditMode
              ? t("menu.saveChanges", { defaultValue: "Save Changes" })
              : isDuplicateMode
                ? t("menu.saveCopyDraft", { defaultValue: "Save Copy as Draft" })
                : t("menu.saveDraft", { defaultValue: "Save as Draft" })
        }
      />

      <ImportMenuItemsModal
        existingMenus={existingMenus.filter((menu) => menu.id !== formState.id)}
        isOpen={Boolean(formState.isImportModalOpen)}
        onAdd={actions.handleAddImportedItems}
        onClose={() => actions.setField("isImportModalOpen", false)}
        onRequestMenuItems={actions.handleImportMenuItemsRequest}
      />
    </section>
  );
}
