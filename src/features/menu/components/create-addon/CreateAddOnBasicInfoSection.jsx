import { Image, Package } from "lucide-react";
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
  description,
  disabled = false,
  fieldErrors,
  image,
  mealTypeOptions,
  mealTypes,
  onAddOnNameChange,
  onDescriptionChange,
  onImageSelect,
  onMealTypesChange,
  onPriceChange,
  price,
  isStandalone = false,
}) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-7 border-b border-[#e5e7eb] py-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-[#202a34]"><Package size={18} className="text-[#7b8793]" />{t("menu.addOnDetails", { defaultValue: "Add-on Details" })}</h2>
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
              <Label>{t("menu.price", { defaultValue: "Price" })} <span className="ml-1 text-xs font-normal text-[#7b8793]">{isStandalone ? "NOK / gjest" : "NOK"}</span></Label>
              <TextInput
                disabled={disabled}
                onChange={onPriceChange}
                placeholder="0.00"
                type="number"
                min="0"
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
        </div>
      </section>

      <section className="min-w-0 lg:border-l lg:border-[#edf0f2] lg:pl-7">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-[#202a34]"><Image size={18} className="text-[#7b8793]" />{t("menu.productImage", { defaultValue: "Product Image" })}</h2>
        <div className="[&>label]:aspect-[4/3] [&>label]:h-auto [&>label]:border-[#dce1e6] [&>label]:bg-[#f7f9fa] [&>label]:transition-colors [&>label]:hover:border-[#23745d] [&>label]:hover:bg-[#f1f7f4]">
        <UploadBox
          disabled={disabled}
          image={image}
          label={t("menu.upload", { defaultValue: "Click or drag to upload" })}
          onFileSelect={onImageSelect}
        />
        </div>
      </section>
    </div>
  );
}
