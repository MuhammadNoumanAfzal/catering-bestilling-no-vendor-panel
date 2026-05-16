import { Info } from "lucide-react";

export default function DeliveryInfoNote({ children }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-[8px] bg-[#f3f6f8] px-3 py-2">
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#9aa8b4] text-[#6f7e8b]">
        <Info size={10} />
      </span>
      <span className="type-subpara text-[#5f6872]">{children}</span>
    </div>
  );
}
