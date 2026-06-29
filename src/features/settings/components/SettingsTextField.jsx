export default function SettingsTextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
  disabled = false,
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-bold text-[#2a211b]">{label}</span>
      {multiline ? (
        <textarea
          className={`type-subpara min-h-[96px] w-full resize-none rounded-[7px] border border-[#cec5bd] bg-white px-3 py-3 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
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
          className={`type-subpara h-[38px] rounded-[7px] border border-[#cec5bd] bg-white px-3 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
            disabled ? "cursor-not-allowed bg-[#f5f0eb] text-[#8d7f73]" : ""
          }`}
          disabled={disabled}
          onChange={onChange}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      )}
    </label>
  );
}
