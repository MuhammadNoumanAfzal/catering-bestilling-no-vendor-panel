import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, SelectInput, TextArea, TextInput, UploadBox } from "./CreateMenuFields";

export default function CreateMenuBasicInfoSection({
  category,
  categoryOptions,
  coverImage,
  description,
  disabled = false,
  galleryImage,
  menuTitle,
  menuType,
  menuTypeOptions,
  onCategoryChange,
  onCoverImageSelect,
  onDescriptionChange,
  onGalleryImageSelect,
  onMenuTitleChange,
  onMenuTypeChange,
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
            <Label>Category</Label>
            <SelectInput
              disabled={disabled}
              onChange={onCategoryChange}
              options={categoryOptions}
              placeholder="Select event type"
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

        <div>
          <Label>Cover Image</Label>
          <UploadBox
            disabled={disabled}
            image={coverImage}
            onFileSelect={onCoverImageSelect}
          />
        </div>

        <div className="w-[110px]">
          <UploadBox
            compact
            disabled={disabled}
            image={galleryImage}
            label=""
            onFileSelect={onGalleryImageSelect}
          />
        </div>
      </div>
    </CreateMenuSectionCard>
  );
}
