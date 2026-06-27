export default function DeliveryTextArea({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  rows = 4,
  error = "",
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="type-para text-[#1a1410]">{label}</span>
      <textarea
        className={`type-para min-h-[96px] rounded-[7px] border bg-white px-3 py-2.5 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
          error ? "border-[#d25545]" : "border-[#cec5bd]"
        } ${disabled ? "cursor-not-allowed bg-[#f3f0ec] text-[#998d82]" : ""}`}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
      {error ? (
        <span className="type-subpara text-[#d25545]">{error}</span>
      ) : null}
    </label>
  );
}
