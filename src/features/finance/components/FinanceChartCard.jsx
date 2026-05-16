export default function FinanceChartCard({ points }) {
  const maxValue = Math.max(...points);
  const minValue = Math.min(...points);
  const normalizedPoints = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100;
    const ratio = (point - minValue) / (maxValue - minValue || 1);
    const y = 88 - ratio * 62;
    return `${x},${y}`;
  });

  return (
    <section className="rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-4 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h5 m-0 text-[#181310]">Earning Overview</h2>
          <p className="type-para mt-1 text-[#8f8174]">
            Revenue performance over the last 7 days
          </p>
        </div>
        <span className="rounded-[6px] bg-[#d96e39] px-2 py-1 text-[10px] font-bold text-white">
          Earning
        </span>
      </div>

      <div className="rounded-[10px] border border-[#efe6de] bg-[linear-gradient(180deg,#fff7f3_0%,#fff2ea_100%)] p-3">
        <div className="grid grid-cols-[36px_1fr] gap-3">
          <div className="flex h-[128px] flex-col justify-between text-[10px] font-medium text-[#9e8f84]">
            <span>$1000</span>
            <span>$750</span>
            <span>$500</span>
            <span>$250</span>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-[8px] bg-[linear-gradient(180deg,rgba(217,110,57,0.20)_0%,rgba(217,110,57,0.03)_100%)]" />
            <svg viewBox="0 0 100 100" className="relative h-[128px] w-full overflow-visible">
              <defs>
                <linearGradient id="financeArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(217,110,57,0.42)" />
                  <stop offset="100%" stopColor="rgba(217,110,57,0.03)" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                points={normalizedPoints.join(" ")}
                stroke="#de6f39"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 flex justify-between text-[10px] font-medium text-[#9e8f84]">
              <span>Oct 1</span>
              <span>Oct 10</span>
              <span>Oct 20</span>
              <span>Oct 30</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
