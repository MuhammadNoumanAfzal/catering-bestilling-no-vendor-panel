import { CalendarDays, Circle, Wallet } from "lucide-react";

const iconMap = {
  orange: Wallet,
  green: Circle,
  blue: CalendarDays,
};

const toneStyles = {
  orange: "bg-[#fff4ec] text-[#d96e39]",
  green: "bg-[#effaf2] text-[#35a853]",
  blue: "bg-[#eef4ff] text-[#4e78d8]",
};

const amountStyles = {
  orange: "text-[#d96e39]",
  green: "text-[#35a853]",
  blue: "text-[#4e78d8]",
};

export default function FinancePayoutStatus({ items }) {
  return (
    <section className="rounded-[12px] border border-[#ddd5ce] bg-white px-5 py-5 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <h2 className="type-h4 m-0 text-[#181310]">Payout Status</h2>

      <div className="mt-4 flex flex-col gap-3.5">
        {items.map((item) => {
          const Icon = iconMap[item.tone];

          return (
            <div
              key={item.title}
              className="flex items-start justify-between gap-4 rounded-[12px] border border-[#efe6de] px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${toneStyles[item.tone]}`}
                >
                  <Icon size={18} />
                </span>
                <span>
                  <strong className="type-para block text-[15px] text-[#1a1410]">{item.title}</strong>
                  <span className="type-para text-[13px] text-[#86786d]">{item.description}</span>
                </span>
              </div>
              <span className={`type-para text-[15px] font-bold ${amountStyles[item.tone]}`}>
                {item.amount}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
