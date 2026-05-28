export default function SettingsDangerActionModal({
  actionLabel,
  description,
  isDanger = false,
  onCancel,
  onConfirm,
  title,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div
        aria-modal="true"
        className="w-full max-w-[380px] overflow-hidden rounded-[12px] bg-white shadow-[0_28px_70px_rgba(0,0,0,0.32)]"
        role="dialog"
      >
        <div className="px-6 py-6 text-center">
          <h2
            className={`type-h3 m-0 ${isDanger ? "text-[#ff2918]" : "text-[#181310]"}`}
          >
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-[250px] text-[11px] leading-[1.45] text-[#6f6258]">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 border-t border-[#ddd4cc]">
          <button
            className="h-[42px] cursor-pointer border-r border-[#ddd4cc] bg-white text-[11px] font-bold text-[#1f1814]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`h-[42px] cursor-pointer bg-white text-[11px] font-bold ${
              isDanger ? "text-[#ff2918]" : "text-[#ff2918]"
            }`}
            onClick={onConfirm}
            type="button"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
