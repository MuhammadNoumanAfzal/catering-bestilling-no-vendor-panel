import { ChevronDown } from "lucide-react";

export default function SupportFieldSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[14px] font-bold text-[#2a211b]">{label}</span>
      <div className="relative">
        <select
          className="h-[42px] w-full appearance-none rounded-[8px] border border-[#d8d0c8] bg-white px-3 pr-8 text-[14px] text-[#241913] outline-none transition focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
          onChange={onChange}
          value={value}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7064]"
          size={14}
        />
      </div>
    </label>
  );
}
