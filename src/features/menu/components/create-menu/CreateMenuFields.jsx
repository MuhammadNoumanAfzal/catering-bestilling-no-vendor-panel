import { ChevronDown, Upload } from "lucide-react";

export function Label({ children }) {
  return <span className="mb-1 block text-[14px] font-bold text-[#211913]">{children}</span>;
}

export function TextInput({
  disabled = false,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <input
      className="h-[42px] w-full rounded-[8px] border border-[#d7cec4] bg-white px-3 text-[14px] text-[#1f1814] outline-none transition placeholder:text-[#aea39a] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] disabled:cursor-not-allowed disabled:bg-[#f5f2ef] disabled:text-[#7f7369]"
      disabled={disabled}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
}

export function TextArea({ disabled = false, placeholder, value, onChange }) {
  return (
    <textarea
      className="min-h-[88px] w-full resize-none rounded-[8px] border border-[#d7cec4] bg-white px-3 py-3 text-[14px] text-[#1f1814] outline-none transition placeholder:text-[#aea39a] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] disabled:cursor-not-allowed disabled:bg-[#f5f2ef] disabled:text-[#7f7369]"
      disabled={disabled}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  );
}

export function SelectInput({
  disabled = false,
  options,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="relative">
      <select
        className="h-[42px] w-full cursor-pointer appearance-none rounded-[8px] border border-[#d7cec4] bg-white px-3 pr-8 text-[14px] text-[#1f1814] outline-none transition focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] disabled:cursor-not-allowed disabled:bg-[#f5f2ef] disabled:text-[#7f7369]"
        disabled={disabled}
        onChange={onChange}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7064]"
        size={14}
      />
    </div>
  );
}

export function UploadBox({
  compact = false,
  disabled = false,
  image,
  label = "Click to drag to upload",
  onFileSelect,
}) {
  async function handleChange(event) {
    const file = event.target.files?.[0];

    if (!file || !onFileSelect) {
      return;
    }

    await onFileSelect(file);
    event.target.value = "";
  }

  return (
    <label
      className={`flex w-full flex-col items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-[#cfc5bc] bg-[#f3f3f3] text-center ${
        compact ? "h-[94px]" : "h-[122px]"
      } ${disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
    >
      <input
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
        type="file"
      />
      {image ? (
        <img alt="Uploaded preview" className="h-full w-full object-cover" src={image} />
      ) : (
        <>
          <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#d06d3a] shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            <Upload size={12} />
          </span>
          <span className="text-[12px] font-semibold text-[#211913]">{label}</span>
          <span className="mt-1 text-[11px] font-medium text-[#8a7d72]">
            PNG, JPG, or WEBP (max 2MB)
          </span>
        </>
      )}
    </label>
  );
}

export function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-[#cf6e38]" : "bg-[#d7cec4]"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label && <span className="text-[13px] font-semibold text-[#211913]">{label}</span>}
    </label>
  );
}
