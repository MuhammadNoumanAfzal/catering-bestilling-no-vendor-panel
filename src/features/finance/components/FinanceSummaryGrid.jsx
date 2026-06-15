import FinanceStatCard from "./FinanceStatCard";

export default function FinanceSummaryGrid({ cards }) {
  return (
    <div className="grid grid-cols-4 gap-3 max-[1120px]:grid-cols-2 max-[620px]:grid-cols-2">
      {cards.map((card) => (
        <FinanceStatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
