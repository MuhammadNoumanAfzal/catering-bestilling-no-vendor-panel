import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SettingsSelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  function handleSelect(nextValue) {
    onChange({ target: { value: nextValue } });
    setIsOpen(false);
  }

  return (
    <label className="flex flex-col gap-1">
      {label ? <span className="text-[13px] font-bold text-[#2a211b]">{label}</span> : null}
      <div className="relative" ref={containerRef}>
        <button
          className="type-subpara flex h-[38px] w-full cursor-pointer items-center justify-between rounded-[7px] border border-[#cec5bd] bg-white px-3 text-left text-[#201712] outline-none transition hover:border-[#cf6e38] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] disabled:pointer-events-none disabled:opacity-45 disabled:bg-[#f6f2ee] disabled:text-[#8d7f73]"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span className={selectedOption ? (disabled ? "text-[#8d7f73]" : "text-[#201712]") : "text-[#b0a59b]"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={`shrink-0 text-[#7d7064] transition ${isOpen ? "rotate-180" : ""}`}
            size={14}
          />
        </button>

        {isOpen ? (
          <div className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-full overflow-hidden rounded-[8px] border border-[#ddd4cc] bg-white py-1 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
            {options.map((option) => {
              const isActive = option.value === value;

              return (
                <button
                  key={option.value}
                  className={`block w-full cursor-pointer px-3 py-1.5 text-left text-[12px] transition ${
                    isActive
                      ? "bg-[#fff1eb] font-semibold text-[#d96e39]"
                      : "text-[#40352f] hover:bg-[#faf5f1]"
                  }`}
                  onClick={() => handleSelect(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </label>
  );
}
