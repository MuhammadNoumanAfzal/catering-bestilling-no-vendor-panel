import DetailPanel from "./DetailPanel";

export default function FinancialSummaryPanel({ summary }) {
  return (
    <DetailPanel title="Financial Summary">
      <div className="flex flex-col gap-[10px]">
        {summary.map((item, index) => (
          <div
            key={item.label}
            className={`flex items-start justify-between gap-3 text-[16px]  text-black  ${
              index === summary.length - 1
                ? "mt-0.5 border-t border-[#ebe2d9] pt-[10px] text-base text-[#17120e]"
                : ""
            }`}
          >
            <span>{item.label}</span>
            <p>{item.value}</p>
          </div>
        ))}
      </div>
    </DetailPanel>
  );
}
