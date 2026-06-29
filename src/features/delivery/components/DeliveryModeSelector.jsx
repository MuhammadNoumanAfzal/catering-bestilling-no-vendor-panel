import { Building2, Truck } from "lucide-react";

const iconMap = {
  delivery: Truck,
  pickup: Building2,
};

export default function DeliveryModeSelector({
  modes,
  selectedModes,
  onToggleMode,
  disabled = false,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
      {modes.map((mode) => {
        const Icon = iconMap[mode.id];
        const isActive = selectedModes.includes(mode.id);

        return (
          <button
            key={mode.id}
            className={`relative flex min-h-[120px] flex-col items-center justify-center rounded-[8px] cursor-pointer border px-3 py-4 text-center transition duration-150 ${
              isActive
                ? "border-[#ef8b5d] bg-[#fff5f0] text-[#ce6f3f]"
                : "border-[#cec6bf] bg-[#f3f3f3] text-[#8a7d72]"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            disabled={disabled}
            onClick={() => onToggleMode(mode.id)}
            type="button"
          >
            <span
              className={`absolute left-3 top-3 h-[11px] w-[11px] rounded-full border ${
                isActive ? "border-[#d96e39]" : "border-[#7d7168]"
              }`}
            >
              {isActive ? (
                <span className="absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d96e39]" />
              ) : null}
            </span>
            <span
              className={`flex h-[52px] w-[52px] items-center justify-center rounded-full ${
                isActive ? "bg-[#fff1ea] text-[#d66d3a]" : "bg-[#ececec] text-[#8a7d72]"
              }`}
            >
              <Icon size={40} strokeWidth={2.1} />
            </span>
            <span className="type-h5 mt-2.5 text-[#1f1814]">{mode.title}</span>
            <span className="type-subpara mt-1 ">{mode.description}</span>
          </button>
        );
      })}
    </div>
  );
}
