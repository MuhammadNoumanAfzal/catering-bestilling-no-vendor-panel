import { Banknote, CircleX, Clock3, WalletCards } from "lucide-react";

const iconMap = {
  camera: Banknote,
  wallet: WalletCards,
  close: CircleX,
  clock: Clock3,
};

export default function FinanceStatCard({ label, value, accent, icon }) {
  const Icon = iconMap[icon] ?? Banknote;

  return (
    <div className="rounded-[12px] border border-[#ece5de] bg-white px-3 pb-3 pt-2.5 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <span
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-[8px]"
        style={{ backgroundColor: accent }}
      >
        <Icon size={38} className="text-[#d7713d]" />
      </span>
      <p className="m-0 type-h6 font-bold leading-[1.2] text-[#18120e]">{label}</p>
      <p className="type-h4 mt-1.5 leading-none text-[#16110d]">{value}</p>
    </div>
  );
}
