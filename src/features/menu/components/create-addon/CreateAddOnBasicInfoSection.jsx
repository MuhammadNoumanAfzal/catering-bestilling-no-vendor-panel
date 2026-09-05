import CreateMenuSectionCard from "../create-menu/CreateMenuSectionCard";
import { useTranslation } from "react-i18next";
import {
  Label,
  MultiSelectInput,
  TextArea,
  TextInput,
  UploadBox,
} from "../create-menu/CreateMenuFields";

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-[12px] font-medium text-[#d2542f]">{message}</p>;
}

export default function CreateAddOnBasicInfoSection({
  addOnName,
  categories,
  categoryOptions,
  description,
  disabled = false,
  fieldErrors,
  image,
  mealTypeOptions,
  mealTypes,
  onAddOnNameChange,
  onCategoryToggle,
  onDescriptionChange,
  onImageSelect,
  onMealTypesChange,
  onPriceChange,
  price,
}) {
  const { t } = useTranslation();
  function getOptionValue(option) {
    return typeof option === "string" ? option : option.value;
  }

  function getOptionLabel(option) {
    return typeof option === "string" ? option : option.label;
  }

  return (
    <div className="grid grid-cols-[minmax(0,1.32fr)_minmax(240px,0.78fr)] gap-4 max-[980px]:grid-cols-1">
      <CreateMenuSectionCard
        description={t("menu.addOnDetailsDescription", { defaultValue: "Create a new extra item for your customers to customize their meals." })}
        title={t("menu.addOnDetails", { defaultValue: "Add-on Details" })}
      >
        <div className="grid gap-4">
          <div>
            <Label>{t("menu.addOnName", { defaultValue: "Add-on Name" })}</Label>
            <TextInput
              disabled={disabled}
              onChange={onAddOnNameChange}
              placeholder={t("menu.enterAddOnName", { defaultValue: "Enter add-on name" })}
              value={addOnName}
            />
            <FieldError message={fieldErrors?.addOnName} />
          </div>

          <div>
            <Label>{t("menu.description", { defaultValue: "Description" })}</Label>
            <TextArea
              disabled={disabled}
              onChange={onDescriptionChange}
              placeholder={t("menu.addOnDescriptionPlaceholder", { defaultValue: "Describe this add-on and how it complements your menus..." })}
              value={description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
            <div>
              <Label>{t("menu.price", { defaultValue: "Price" })}</Label>
              <TextInput
                disabled={disabled}
                onChange={onPriceChange}
                placeholder="0.00"
                type="number"
                value={price}
              />
              <FieldError message={fieldErrors?.price} />
            </div>

            <div>
              <Label>{t("menu.mealTypes", { defaultValue: "Meal Types" })}</Label>
              <MultiSelectInput
                disabled={disabled}
                onChange={onMealTypesChange}
                options={mealTypeOptions}
                placeholder={t("menu.selectMealTypes", { defaultValue: "Select one or more meal types" })}
                value={mealTypes}
              />
              <FieldError message={fieldErrors?.mealTypes} />
            </div>
          </div>

          <div className="rounded-[10px] border border-[#ddd4cb] bg-[#fffaf6] px-3 py-3">
            <Label>{t("menu.category", { defaultValue: "Category" })}</Label>
            <p className="mb-2 text-[13px] font-medium text-[#8b7f74]">
              {t("menu.groupCategories", { defaultValue: "Group this add-on under one or more categories so customers can find it more easily." })}
            </p>

            <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#4f443d]">
              {t("menu.chooseCategories", { defaultValue: "Choose one or more categories" })}
            </span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = Array.isArray(categories) && categories.includes(optionValue);

                return (
                  <button
                    key={optionValue}
                    className={`cursor-pointer rounded-full border px-3 py-[6px] text-[13px] font-semibold transition ${
                      isSelected
                        ? "border-[#cf6e38] bg-[#fff1e8] text-[#cf6e38]"
                        : "border-[#d7cec4] bg-white text-[#544840]"
                    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                    disabled={disabled}
                    onClick={() => onCategoryToggle(optionValue)}
                    type="button"
                  >
                    {optionLabel}
                  </button>
                );
              })}
            </div>
            <FieldError message={fieldErrors?.categories} />
          </div>
        </div>
      </CreateMenuSectionCard>

      <CreateMenuSectionCard description={t("menu.uploadFormat", { defaultValue: "PNG, JPG or WEBP up to 5MB." })} title={t("menu.productImage", { defaultValue: "Product Image" })}>
        <UploadBox
          disabled={disabled}
          image={image}
          label={t("menu.upload", { defaultValue: "Click or drag to upload" })}
          onFileSelect={onImageSelect}
        />
      </CreateMenuSectionCard>
    </div>
  );
}
