import { Building2, Truck } from "lucide-react";

const iconMap = {
  delivery: Truck,
  pickup: Building2,
};

export default function DeliveryModeSelector({ modes, selectedMode, onSelectMode }) {
  return (
    <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
      {modes.map((mode) => {
        const Icon = iconMap[mode.id];
        const isActive = selectedMode === mode.id;

        return (
          <button
            key={mode.id}
            className={`flex min-h-[88px] flex-col items-center justify-center rounded-[8px] border px-3 py-3 text-center transition duration-150 ${
              isActive
                ? "border-[#ef8b5d] bg-[#fff5f0] text-[#ce6f3f]"
                : "border-[#cec6bf] bg-[#f3f3f3] text-[#8a7d72]"
            }`}
            onClick={() => onSelectMode(mode.id)}
            type="button"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                isActive ? "bg-[#fff1ea] text-[#d66d3a]" : "bg-[#ececec] text-[#8a7d72]"
              }`}
            >
              <Icon size={24} strokeWidth={2.1} />
            </span>
            <span className="type-para mt-2.5 text-[#1f1814]">{mode.title}</span>
            <span className="type-subpara mt-1 text-[#8f8377]">{mode.description}</span>
          </button>
        );
      })}
    </div>
  );
}
