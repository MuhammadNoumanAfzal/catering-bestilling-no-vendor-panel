import { Plus, Save, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CreateAddOnActionsBar({
  onCancel,
  onPrimaryAction,
  onSave,
  primaryLabel = "",
  isEditMode,
  saveLabel = "",
  disabled = false,
}) {
  const { t } = useTranslation();
  return (
    <div className="sticky bottom-0 z-20 mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] bg-white/95 py-4 backdrop-blur-sm">
      {!isEditMode && primaryLabel ? (
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-[13px] font-medium text-[#596672] transition hover:bg-[#f1f5f3] hover:text-[#17634c] disabled:opacity-50"
          onClick={onPrimaryAction}
          disabled={disabled}
          type="button"
        >
          <Plus size={16} />{primaryLabel.replace(/^\+\s*/, "")}
        </button>
      ) : null}

      <div className={`ml-auto flex flex-wrap items-center justify-end gap-2 ${isEditMode ? "w-full" : ""}`}>
        <button
          className="min-h-10 rounded-md border border-[#dce1e6] bg-white px-4 py-2 text-[13px] font-medium text-[#596672] transition hover:bg-[#f6f8f9] disabled:opacity-50"
          onClick={onCancel}
          disabled={disabled}
          type="button"
        >
          {t("menu.cancel", { defaultValue: "Cancel" })}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#c95e2b] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#ad4d22] disabled:cursor-wait disabled:opacity-60"
          onClick={onSave}
          disabled={disabled}
          type="button"
        >
          {disabled ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{saveLabel || (isEditMode ? t("menu.saveChanges", { defaultValue: "Save Changes" }) : t("menu.saveAddOn", { defaultValue: "Save Add-on" }))}
        </button>
      </div>
    </div>
  );
}
