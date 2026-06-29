export default function CreateAddOnActionsBar({
  onCancel,
  onPrimaryAction,
  onSave,
  primaryLabel = "",
  isEditMode,
  saveLabel = "",
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      {!isEditMode && primaryLabel ? (
        <button
          className="min-h-[40px] flex-1 cursor-pointer rounded-[10px] border border-[#d7cec4] bg-white px-5 text-[14px] font-bold text-[#4c4038] transition hover:border-[#cf6e38] hover:text-[#cf6e38]"
          onClick={onPrimaryAction}
          type="button"
        >
          {primaryLabel}
        </button>
      ) : null}

      <div className={`flex items-center gap-3 ${isEditMode ? "w-full justify-end" : ""}`}>
        <button
          className="h-[42px] min-w-[94px] cursor-pointer rounded-[10px] border border-[#1d1713] bg-white px-4 text-[14px] font-bold text-[#1d1713]"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="h-[42px] min-w-[122px] cursor-pointer rounded-[10px] bg-[#cf6e38] px-4 text-[14px] font-bold text-white"
          onClick={onSave}
          type="button"
        >
          {saveLabel || (isEditMode ? "Save Changes" : "Save Add-on")}
        </button>
      </div>
    </div>
  );
}
