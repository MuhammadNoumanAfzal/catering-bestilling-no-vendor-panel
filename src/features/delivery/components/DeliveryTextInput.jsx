export default function DeliveryTextInput({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="type-para text-[#1a1410]">{label}</span>
      <input
        className={`type-para h-[40px] rounded-[7px] border border-[#cec5bd] bg-white px-3 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
          disabled ? "cursor-not-allowed bg-[#f3f0ec] text-[#998d82]" : ""
        }`}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  );
}
