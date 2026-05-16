export default function MenuTextField({ label, placeholder, value, onChange, className = "" }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="type-subpara text-[#19130f]">{label}</span>
      <input
        className="type-subpara h-[38px] rounded-[7px] border border-[#ccc5be] bg-white px-3 text-[#231914] outline-none transition duration-150 placeholder:text-[#b2aaa4] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  );
}
