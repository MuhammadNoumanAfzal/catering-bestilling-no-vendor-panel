export default function CreateMenuActionsBar({
  hidePublish = false,
  onCancel,
  onPublish,
  onSaveDraft,
  saveLabel = "Save as Draft",
}) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
      <button
        className="h-[40px] min-w-[112px] cursor-pointer rounded-[8px] border border-[#4a4038] bg-white px-4 text-[13px] font-bold text-[#15110f]"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        className="h-[40px] min-w-[122px] cursor-pointer rounded-[8px] border border-[#d8cfc6] bg-white px-4 text-[13px] font-bold text-[#15110f]"
        onClick={onSaveDraft}
        type="button"
      >
        {saveLabel}
      </button>
      {hidePublish ? null : (
        <button
          className="h-[40px] min-w-[128px] cursor-pointer rounded-[8px] bg-[#d96e39] px-4 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(217,110,57,0.26)]"
          onClick={onPublish}
          type="button"
        >
          Publish Menu
        </button>
      )}
    </div>
  );
}
