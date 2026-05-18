import { BadgeCheck, Bike, ChefHat, ChevronRight } from "lucide-react";

const iconMap = {
  chef: ChefHat,
  check: BadgeCheck,
  delivery: Bike,
};

const toneClasses = {
  "is-blue": "border-[#bcd4ff] bg-[#f5f9ff] text-[#4f7fe0]",
  "is-green": "border-[#bee7c7] bg-[#f5fff7] text-[#38a35c]",
  "is-amber": "border-[#f3d3a2] bg-[#fffaf2] text-[#e5a449]",
};

export default function KitchenStatus({ items }) {
  return (
    <>
      <p className="type-para -mt-1 text-[#6f645b]">
        Live overview of your current operations
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2.5 max-[960px]:grid-cols-1 cursor-pointer">
        {items.map((item) => {
          const Icon = iconMap[item.icon];

          return (
            <article
              key={item.label}
              className={`rounded border px-[10px] pb-[10px] pt-2 ${toneClasses[item.tone]}`}
            >
              <span className="type-para">{item.label}</span>
              <strong className="type-h1 mt-1 block text-[48px] leading-[0.95] text-[#201914]">
                {item.value}
              </strong>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="type-h5 text-[#201914]">{item.sublabel}</span>
                {Icon ? <Icon size={20} strokeWidth={2} /> : null}
              </div>
            </article>
          );
        })}
      </div>
      <button
        className="type-para mt-2 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[#3f78d4]"
        type="button"
      >
        Go to Orders
        <ChevronRight size={14} strokeWidth={2.4} />
      </button>
    </>
  );
}
