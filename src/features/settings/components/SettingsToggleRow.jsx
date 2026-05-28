export default function SettingsToggleRow({
  label,
  helper,
  checked,
  onToggle,
  tone = "default",
}) {
  const activeClasses =
    tone === "danger"
      ? "bg-[#de6f39]"
      : "bg-[#de6f39]";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#f0e7df] py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <div>
        <p className="text-[12px] font-bold text-[#201914]">{label}</p>
        {helper ? (
          <p className="mt-1 text-[11px] text-[#8a7c70]">{helper}</p>
        ) : null}
      </div>
      <button
        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition ${
          checked ? activeClasses : "bg-[#e7ddd5]"
        }`}
        onClick={onToggle}
        type="button"
      >
        <span
          className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-[18px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}
