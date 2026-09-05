import { ChevronDown, ChevronUp, Clock3, FileCheck2, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, MultiSelectInput, TextInput, UploadBox } from "./CreateMenuFields";

export default function CreateMenuItemsSection({
  addMenuItem,
  allergenFeatureMessage = "",
  allergenFeatureUnavailable = false,
  allergenOptions,
  disabled = false,
  handleItemImageSelect,
  menuItemErrors = {},
  menuItems,
  onAddFromOtherPackage,
  removeMenuItem,
  saveMenuItem,
  toggleMenuItemExpanded,
  updateMenuItem,
}) {
  const { t } = useTranslation();
  const hasUnsavedItem = menuItems.some((item) => !item.isSaved);

  return (
    <CreateMenuSectionCard
      description={t("menu.itemsDescription", { defaultValue: "Add the dishes and drinks included in the base price." })}
      title={t("menu.menuItems", { defaultValue: "Menu Items" })}
    >
      <div className="space-y-4">
        {menuItems.map((item, index) => {
          const itemErrors = menuItemErrors[item.id] || {};
          const summaryTitle = item.title?.trim() || t("menu.menuItem", { count: index + 1, defaultValue: `Menu Item ${index + 1}` });
          const summaryDescription = item.description?.trim() || t("menu.noDescription", { defaultValue: "No description saved yet." });

          return (
            <div
              key={item.id}
              className={`rounded-[16px] border transition ${
                item.isExpanded
                  ? "overflow-visible border-[#efc9b4] bg-[#fffdfb] shadow-[0_12px_30px_rgba(58,40,25,0.08)]"
                  : "overflow-hidden border-[#e4dbd2] bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e7de] px-4 py-3">
                <button
                  className="flex min-w-0 flex-1 items-center gap-3 bg-transparent p-0 text-left border-0 cursor-pointer"
                  disabled={disabled}
                  onClick={() => toggleMenuItemExpanded(item.id)}
                  type="button"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      item.isSaved ? "bg-[#eef8ef] text-[#2b8a46]" : "bg-[#fff1e8] text-[#cf6e38]"
                    }`}
                  >
                    {item.isSaved ? <FileCheck2 size={18} /> : <Clock3 size={18} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-extrabold text-[#211913]">
                      {summaryTitle}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] font-medium text-[#7e7065]">
                      {summaryDescription}
                    </span>
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                      item.isSaved
                        ? "bg-[#edf8ef] text-[#2b8a46]"
                        : "bg-[#fff1e8] text-[#cf6e38]"
                    }`}
                  >
                    {item.isSaved ? t("menu.saved", { defaultValue: "Saved" }) : t("menu.draft", { defaultValue: "Draft" })}
                  </span>
                  <button
                    aria-label={item.isExpanded ? t("menu.collapseItem", { defaultValue: "Collapse menu item" }) : t("menu.expandItem", { defaultValue: "Expand menu item" })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd6] bg-[#fffaf7] text-[#9a8678] shadow-[0_2px_8px_rgba(58,40,25,0.06)] transition hover:border-[#cf6e38] hover:bg-[#fff1e8] hover:text-[#cf6e38] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                    onClick={() => toggleMenuItemExpanded(item.id)}
                    type="button"
                  >
                    {item.isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button
                    aria-label={t("menu.removeItem", { defaultValue: "Remove menu item" })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd6] bg-[#fffaf7] text-[#9a8678] shadow-[0_2px_8px_rgba(58,40,25,0.06)] transition hover:border-[#cf6e38] hover:bg-[#fff1e8] hover:text-[#cf6e38] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                    onClick={() => removeMenuItem(item.id)}
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {item.isExpanded ? (
                <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-3 p-4 max-[720px]:grid-cols-1">
                  <UploadBox
                    compact
                    disabled={disabled}
                    image={item.image}
                    label={t("menu.upload", { defaultValue: "Click or drag to upload" })}
                    onFileSelect={(file) => handleItemImageSelect(item.id, file)}
                  />

                  <div>
                    <div>
                      <Label>{t("menu.title", { defaultValue: "Title" })}</Label>
                      <TextInput
                        disabled={disabled}
                        onChange={(event) => updateMenuItem(item.id, "title", event.target.value)}
                        placeholder={t("menu.enterItemTitle", { defaultValue: "Enter item title" })}
                        value={item.title}
                      />
                      {itemErrors.title ? (
                        <p className="mt-1 text-[12px] font-medium text-[#d2542f]">
                          {itemErrors.title}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <Label>{t("menu.description", { defaultValue: "Description" })}</Label>
                      <textarea
                        disabled={disabled}
                        onChange={(event) =>
                          updateMenuItem(item.id, "description", event.target.value)
                        }
                        placeholder={t("menu.itemDescriptionPlaceholder", { defaultValue: "Add a short description for this item" })}
                        rows={3}
                        value={item.description || ""}
                        className="min-h-[96px] w-full rounded-[8px] border border-[#ded4cb] bg-white px-3 py-2.5 text-[14px] text-[#211913] outline-none placeholder:text-[#a59689] disabled:cursor-not-allowed disabled:bg-[#f6f1ec] disabled:text-[#8c7f73]"
                      />
                      {itemErrors.description ? (
                        <p className="mt-1 text-[12px] font-medium text-[#d2542f]">
                          {itemErrors.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="relative z-20 mt-3">
                      <Label>{t("menu.allergens", { defaultValue: "Allergens" })}</Label>
                      <MultiSelectInput
                        disabled={disabled || allergenFeatureUnavailable}
                        onChange={(value) => updateMenuItem(item.id, "allergens", value)}
                        options={allergenOptions}
                        placeholder={
                          allergenFeatureUnavailable
                            ? t("menu.allergenUnavailable", { defaultValue: "Allergen API not available in production yet" })
                            : t("menu.selectAllergens", { defaultValue: "Select one or more allergens" })
                        }
                        value={item.allergens}
                      />
                      {allergenFeatureMessage ? (
                        <p className="mt-1 text-[12px] font-medium text-[#8a7c70]">
                          {allergenFeatureMessage}
                        </p>
                      ) : !allergenFeatureUnavailable ? (
                        <p className="mt-1 text-[12px] font-medium text-[#8a7c70]">
                          {t("menu.allergensManaged", { defaultValue: "Allergens are managed by admin and loaded from the backend." })}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#cf6e38] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#bf622f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={disabled}
                        onClick={() => saveMenuItem(item.id)}
                        type="button"
                      >
                        {t("menu.saveItem", { defaultValue: "Save Item" })}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="flex gap-3 max-[480px]:flex-col">
          <button
            className="flex-1 h-[38px] cursor-pointer rounded-[8px] border border-[#d6cdc4] bg-white text-[13px] font-bold text-[#332922] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#faf7f5] transition active:scale-95"
            disabled={disabled || hasUnsavedItem}
            onClick={addMenuItem}
            type="button"
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus size={14} />
              {t("menu.addAnotherItem", { defaultValue: "Add Another Item" })}
            </span>
          </button>
          <button
            className="flex-1 h-[38px] cursor-pointer rounded-[8px] bg-[#cf6e38] text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#bf622f] transition active:scale-95"
            disabled={disabled}
            onClick={onAddFromOtherPackage}
            type="button"
          >
            {t("menu.addFromPackage", { defaultValue: "Add item from other package" })}
          </button>
        </div>
        {hasUnsavedItem ? (
          <p className="text-[12px] font-medium text-[#8a776a]">
            {t("menu.saveItemFirst", { defaultValue: "Save the open item before adding another menu item." })}
          </p>
        ) : null}
      </div>
    </CreateMenuSectionCard>
  );
}
