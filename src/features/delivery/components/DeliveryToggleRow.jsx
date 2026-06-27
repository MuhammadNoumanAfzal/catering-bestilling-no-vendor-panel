export default function DeliveryToggleRow({
  checked,
  label,
  description,
  onChange,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#ebe1d8] bg-[#fffaf6] px-3 py-3">
      <div>
        <p className="type-para m-0 text-[#1b1511]">{label}</p>
        {description ? (
          <p className="type-subpara mt-1 text-[#8c7d71]">{description}</p>
        ) : null}
      </div>
      <button
        aria-pressed={checked}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#cf6e38]" : "bg-[#d6ccc3]"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
