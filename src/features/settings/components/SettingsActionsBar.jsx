import { useTranslation } from "react-i18next";

export default function SettingsActionsBar({
  hasUnsavedChanges,
  onCancel,
  onSave,
  saveMessage,
  isLoading = false,
  isSaving = false,
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-5 flex items-center justify-end gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
      <p className="type-subpara mr-auto text-[#7c7067]">
        {saveMessage ||
          (isLoading
            ? t("settings.loading")
            : hasUnsavedChanges
              ? t("settings.changesReady")
              : t("settings.saved"))}
      </p>
      <button
        className="h-[38px] min-w-[104px] cursor-pointer rounded-[8px] border border-[#4a4038] bg-white px-4 text-[12px] font-bold text-[#15110f] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasUnsavedChanges || isSaving || isLoading}
        onClick={onCancel}
        type="button"
      >
        {t("settings.cancel")}
      </button>
      <button
        className="h-[38px] min-w-[124px] cursor-pointer rounded-[8px] bg-[#d96e39] px-4 text-[12px] font-bold text-white shadow-[0_6px_16px_rgba(217,110,57,0.26)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasUnsavedChanges || isSaving || isLoading}
        onClick={onSave}
        type="button"
      >
        {isSaving ? t("settings.saving") : t("settings.save")}
      </button>
    </div>
  );
}
