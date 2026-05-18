import {
  ArrowUp,
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

export default function OrderMetricCard({ label, value, helper, helperTone, icon }) {
  const Icon = iconMap[icon];

  return (
    <article className="rounded-lg border border-[#e3ddd5] bg-white px-[11px] pb-2.5 pt-[11px] shadow-[0_1px_4px_rgba(38,23,14,0.05)]">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#fff4ef]">
        {Icon ? <Icon className="text-[#d66c3a]" size={28} strokeWidth={2.1} /> : null}
      </div>
      <p className="type-para mt-2 font-bold text-black leading-[1.25] ">{label}</p>
      <strong className="type-h2 mt-1.5 block text-[31px] leading-none text-[#19130f]">{value}</strong>
      <p className="type-para mt-[7px] flex items-center gap-1 whitespace-nowrap text-[10px] text-[#6d6259]">
        {helperTone === "is-positive" ? (
          <span className="inline-flex shrink-0 text-[#2fbe5b]">
            <ArrowUp size={11} strokeWidth={2.2} />
          </span>
        ) : null}
        {helper}
      </p>
    </article>
  );
}
