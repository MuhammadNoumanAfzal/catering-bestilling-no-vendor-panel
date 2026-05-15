import {
  BadgeCheck,
  CheckCheck,
  ClipboardList,
  CookingPot,
  PackageCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

const iconMap = {
  badge: BadgeCheck,
  cart: ShoppingCart,
  check: CheckCheck,
  chef: CookingPot,
  clipboard: ClipboardList,
  package: PackageCheck,
  truck: Truck,
};

export default function OrderMetricCard({ label, value, helper, icon }) {
  const Icon = iconMap[icon];

  return (
    <article className="rounded-lg border border-[#e3ddd5] bg-white px-[11px] pb-2.5 pt-[11px] shadow-[0_1px_4px_rgba(38,23,14,0.05)]">
      <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#fff4ef]">
        {Icon ? <Icon className="text-[#d66c3a]" size={16} strokeWidth={2.1} /> : null}
      </div>
      <p className="type-para mt-2 text-[11px] font-bold leading-[1.25] text-[#27201b]">{label}</p>
      <strong className="type-h2 mt-1.5 block text-[31px] leading-none text-[#19130f]">{value}</strong>
      <p className="type-para mt-[7px] text-[10px] text-[#6d6259]">{helper}</p>
    </article>
  );
}
