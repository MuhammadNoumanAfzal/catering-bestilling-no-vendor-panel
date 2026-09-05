import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import CreateMenuSectionCard from "./CreateMenuSectionCard";
import {
  Label,
  MultiSelectInput,
  SelectInput,
  TextArea,
  TextInput,
  UploadBox,
} from "./CreateMenuFields";

function ImageSlider({ images, t }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-[12px] bg-[#f5f2ef] text-[#7d7064] text-[14px] font-semibold border border-[#d7cec4]">
        {t("menu.noImages", { defaultValue: "No images uploaded" })}
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (idx, e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(idx);
  };

  return (
    <div className="relative h-[240px] w-full overflow-hidden rounded-[12px] border border-[#d7cec4] bg-[#ece7e2] group shadow-sm">
      {/* Slider Images */}
      <img
        src={images[currentIndex]}
        alt={t("menu.mediaGallery", { defaultValue: "Menu Media Gallery" })}
        className="h-full w-full object-cover transition-all duration-300"
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 active:scale-90 transition focus:outline-none"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 active:scale-90 transition focus:outline-none"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-3 py-1.5 shadow-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => handleDotClick(idx, e)}
                type="button"
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-4" : "bg-white/50 w-2"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-[12px] font-medium text-[#d2542f]">{message}</p>;
}

export default function CreateMenuBasicInfoSection({
  category,
  categoryOptions,
  coverImage,
  description,
  disabled = false,
  fieldErrors,
  galleryImages = [],
  menuTitle,
  menuTypes,
  menuTypeOptions,
  occasionOptions,
  selectedOccasions,
  onCategoryChange,
  onCoverImageSelect,
  onDescriptionChange,
  onGalleryImageSelect,
  onRemoveGalleryImage,
  onMenuTitleChange,
  onMenuTypesChange,
  onOccasionsChange,
}) {
  const { t } = useTranslation();
  return (
    <CreateMenuSectionCard
      description={t("menu.basicDescription", { defaultValue: "General details about this catering package." })}
      title={t("menu.basicInformation", { defaultValue: "Basic Information" })}
    >
      <div className="space-y-3">
        <div>
          <Label>{t("menu.menuTitle", { defaultValue: "Menu Title" })}</Label>
          <TextInput
            disabled={disabled}
            onChange={onMenuTitleChange}
            placeholder={t("menu.enterMenuTitle", { defaultValue: "Enter menu title" })}
            value={menuTitle}
          />
          <FieldError message={fieldErrors?.menuTitle} />
        </div>

        <div>
          <Label>{t("menu.description", { defaultValue: "Description" })}</Label>
          <TextArea
            disabled={disabled}
            onChange={onDescriptionChange}
            placeholder={t("menu.menuDescriptionPlaceholder", { defaultValue: "Describe the culinary experience, key highlights, and service style..." })}
            value={description}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
          <div>
            <Label>{t("menu.category", { defaultValue: "Category" })}</Label>
            <SelectInput
              disabled={disabled}
              onChange={onCategoryChange}
              options={categoryOptions}
              placeholder={t("menu.selectCategory", { defaultValue: "Select category" })}
              value={category}
            />
            <FieldError message={fieldErrors?.category} />
          </div>
          <div>
            <Label>{t("menu.foodType", { defaultValue: "Food Type" })}</Label>
            <MultiSelectInput
              disabled={disabled}
              onChange={onMenuTypesChange}
              options={menuTypeOptions}
              placeholder={t("menu.selectFoodTypes", { defaultValue: "Select one or more food types" })}
              value={menuTypes}
            />
            <FieldError message={fieldErrors?.menuTypes} />
          </div>
        </div>

        <div>
          <Label>{t("menu.occasions", { defaultValue: "Occasions" })}</Label>
          <MultiSelectInput
            disabled={disabled}
            onChange={onOccasionsChange}
            options={occasionOptions}
            placeholder={t("menu.selectOccasions", { defaultValue: "Select one or more occasions" })}
            value={selectedOccasions}
          />
          <FieldError message={fieldErrors?.selectedOccasions} />
          <p className="mt-2 text-[12px] font-medium leading-[1.5] text-[#8a776a]">
            {t("menu.occasionHint", { defaultValue: "Rule: Select at least one Food Type to show this menu under Browse by Food Type. Occasion is optional and only controls where the menu appears under Browse by Occasion." })}
          </p>
        </div>

        {disabled ? (
          <div>
            <Label>{t("menu.mediaGallery", { defaultValue: "Menu Media Gallery" })}</Label>
            <ImageSlider t={t} images={[coverImage, ...galleryImages].filter(Boolean)} />
          </div>
        ) : (
          <>
            <div>
              <Label>{t("menu.coverImage", { defaultValue: "Cover Image" })}</Label>
              <UploadBox
                disabled={disabled}
                image={coverImage}
                onFileSelect={onCoverImageSelect}
              />
            </div>

            <div>
              <Label>{t("menu.galleryImages", { defaultValue: "Gallery Images" })}</Label>
              <div className="flex flex-wrap gap-3">
                {galleryImages && galleryImages.map((img, idx) => (
                  <div key={idx} className="relative h-[94px] w-[110px] overflow-hidden rounded-[8px] border border-[#d7cec4] group">
                    <img src={img} alt={t("menu.galleryImage", { count: idx + 1, defaultValue: `Gallery ${idx + 1}` })} className="h-full w-full object-cover" />
                    <button
                      onClick={() => onRemoveGalleryImage(idx)}
                      type="button"
                      aria-label={t("menu.removeGalleryImage", { count: idx + 1, defaultValue: `Remove gallery image ${idx + 1}` })}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-[rgba(28,21,16,0.78)] text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-[#cf6e38] hover:shadow-[0_10px_22px_rgba(207,110,56,0.28)] active:scale-95"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
                <div className="h-[94px] w-[110px]">
                  <UploadBox
                    compact
                    disabled={disabled}
                    image=""
                    label={t("menu.addPhoto", { defaultValue: "Add Photo" })}
                    onFileSelect={onGalleryImageSelect}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </CreateMenuSectionCard>
  );
}
