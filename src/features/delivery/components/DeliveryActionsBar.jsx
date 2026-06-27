export default function DeliveryActionsBar({
  hasUnsavedChanges,
  onCancel,
  onSave,
  saveMessage,
  isSaving = false,
  isLoading = false,
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
      <p className="type-subpara min-h-[18px] text-[#7c7067]">
        {saveMessage ||
          (isLoading
            ? "Loading delivery settings..."
            : hasUnsavedChanges
              ? "You have unsaved changes."
              : "All changes saved.")}
      </p>
      <div className="flex items-center gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
        <button
          className="h-[38px] min-w-[104px] rounded-[8px] border border-[#4a4038] bg-white px-4 text-[12px] font-bold text-[#15110f] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasUnsavedChanges || isSaving || isLoading}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="h-[38px] min-w-[124px] rounded-[8px] bg-[#d96e39] px-4 text-[12px] font-bold text-white shadow-[0_6px_16px_rgba(217,110,57,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasUnsavedChanges || isSaving || isLoading}
          onClick={onSave}
          type="button"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
