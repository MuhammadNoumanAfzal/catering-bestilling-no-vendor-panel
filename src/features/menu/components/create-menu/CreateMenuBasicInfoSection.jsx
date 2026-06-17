import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, MultiSelectInput, SelectInput, TextArea, TextInput, UploadBox } from "./CreateMenuFields";

function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-[12px] bg-[#f5f2ef] text-[#7d7064] text-[14px] font-semibold border border-[#d7cec4]">
        No images uploaded
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
        alt={`Menu Media ${currentIndex + 1}`}
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

export default function CreateMenuBasicInfoSection({
  category,
  categoryOptions,
  coverImage,
  description,
  disabled = false,
  galleryImages = [],
  menuTitle,
  menuType,
  menuTypeOptions,
  onCategoryChange,
  onCoverImageSelect,
  onDescriptionChange,
  onGalleryImageSelect,
  onRemoveGalleryImage,
  onMenuTitleChange,
  onMenuTypeChange,
  onAddNewCategoryClick,
}) {
  return (
    <CreateMenuSectionCard
      description="General details about this catering package."
      title="Basic Information"
    >
      <div className="space-y-3">
        <div>
          <Label>Menu Title</Label>
          <TextInput
            disabled={disabled}
            onChange={onMenuTitleChange}
            placeholder="e.g. Royal Wedding Grand Buffet"
            value={menuTitle}
          />
        </div>

        <div>
          <Label>Description</Label>
          <TextArea
            disabled={disabled}
            onChange={onDescriptionChange}
            placeholder="Describe the culinary experience, key highlights, and service style..."
            value={description}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
          <div>
            <div className="flex items-center justify-between">
              <Label>Category</Label>
              {!disabled && (
                <button
                  type="button"
                  onClick={onAddNewCategoryClick}
                  className="text-[12px] font-extrabold text-[#cf6e38] hover:text-[#bf622f] transition cursor-pointer"
                >
                  + Add New
                </button>
              )}
            </div>
            <MultiSelectInput
              disabled={disabled}
              onChange={onCategoryChange}
              options={categoryOptions}
              placeholder="Select category"
              value={category}
            />
          </div>
          <div>
            <Label>Menu Type</Label>
            <SelectInput
              disabled={disabled}
              onChange={onMenuTypeChange}
              options={menuTypeOptions}
              placeholder="Write menu type"
              value={menuType}
            />
          </div>
        </div>

        {disabled ? (
          <div>
            <Label>Menu Media Gallery Slider</Label>
            <ImageSlider images={[coverImage, ...galleryImages].filter(Boolean)} />
          </div>
        ) : (
          <>
            <div>
              <Label>Cover Image</Label>
              <UploadBox
                disabled={disabled}
                image={coverImage}
                onFileSelect={onCoverImageSelect}
              />
            </div>

            <div>
              <Label>Gallery Images</Label>
              <div className="flex flex-wrap gap-3">
                {galleryImages && galleryImages.map((img, idx) => (
                  <div key={idx} className="relative h-[94px] w-[110px] overflow-hidden rounded-[8px] border border-[#d7cec4] group">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => onRemoveGalleryImage(idx)}
                      type="button"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition shadow-sm"
                    >
                      <span className="leading-none text-[12px] font-bold">&times;</span>
                    </button>
                  </div>
                ))}
                <div className="h-[94px] w-[110px]">
                  <UploadBox
                    compact
                    disabled={disabled}
                    image=""
                    label="Add Photo"
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
