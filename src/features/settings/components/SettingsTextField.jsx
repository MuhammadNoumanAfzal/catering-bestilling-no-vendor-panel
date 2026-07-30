export default function SettingsTextField({
  error = "",
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
  disabled = false,
  inputMode,
  max,
  maxLength,
  min,
  pattern,
  type = "text",
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[13px] font-bold text-[#2a211b]">{label}</span>
      {multiline ? (
        <textarea
          className={`type-subpara min-h-[96px] w-full min-w-0 resize-none rounded-[7px] border bg-white px-3 py-3 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
            error ? "border-[#d96e39]" : "border-[#cec5bd]"
          } ${
            disabled ? "cursor-not-allowed bg-[#f5f0eb] text-[#8d7f73]" : ""
          }`}
          disabled={disabled}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          value={value}
        />
      ) : (
        <input
          className={`type-subpara h-[38px] w-full min-w-0 rounded-[7px] border bg-white px-3 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
            error ? "border-[#d96e39]" : "border-[#cec5bd]"
          } ${
            disabled ? "cursor-not-allowed bg-[#f5f0eb] text-[#8d7f73]" : ""
          }`}
          disabled={disabled}
          inputMode={inputMode}
          max={max}
          maxLength={maxLength}
          min={min}
          onChange={onChange}
          pattern={pattern}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      )}
      {error ? <span className="text-[11px] font-semibold text-[#d96e39]">{error}</span> : null}
    </label>
  );
}
