import { useState } from "react";

const chartLabels = ["Oct 1", "Oct 10", "Oct 20", "Oct 30"];
const earningAxisLabels = ["kr 0", "kr 250", "kr 500", "kr 750", "kr 1000"];
const ordersAxisLabels = ["0", "10", "20", "30", "40"];

function buildChartPoints(points, mode) {
  if (!points.length) {
    return chartLabels.map((label) => ({ label, value: 0 }));
  }

  const sliceSize = Math.max(1, Math.floor(points.length / chartLabels.length));

  return chartLabels.map((label, index) => {
    const startIndex = index * sliceSize;
    const sourceValue =
      points[Math.min(startIndex + sliceSize - 1, points.length - 1)] ??
      points[points.length - 1];

    return {
      label,
      value:
        mode === "orders"
          ? Math.max(8, Math.round(sourceValue / 20))
          : sourceValue,
    };
  });
}

export default function FinanceChartCard({ points }) {
  const [activeTab, setActiveTab] = useState("earning");
  const isOrdersView = activeTab === "orders";
  const chartPoints = buildChartPoints(points, activeTab);
  const axisLabels = isOrdersView ? ordersAxisLabels : earningAxisLabels;
  const maxValue = Math.max(...chartPoints.map((point) => point.value), 1);

  return (
    <section className="flex h-full min-h-[428px] flex-col rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-3 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h3 m-0 text-[#181310]">Earning Overview</h2>
          <p className="type-para mt-1 text-[#6f6258]">
            Revenue performance over the last 7 days
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-[10px] border border-[#e4dbd3] bg-[#faf7f4] p-1">
          <button
            className={`cursor-pointer rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
              !isOrdersView
                ? "bg-[#d96e39] text-white shadow-[0_4px_10px_rgba(217,110,57,0.18)]"
                : "text-[#6f6258]"
            }`}
            onClick={() => setActiveTab("earning")}
            type="button"
          >
            Earning
          </button>
          <button
            className={`cursor-pointer rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
              isOrdersView
                ? "bg-[#d96e39] text-white shadow-[0_4px_10px_rgba(217,110,57,0.18)]"
                : "text-[#6f6258]"
            }`}
            onClick={() => setActiveTab("orders")}
            type="button"
          >
            Orders
          </button>
        </div>
      </div>

      <div className="flex flex-1 rounded-[12px] border border-[#eee6de] bg-white p-3">
        <div className="grid min-h-[320px] w-full grid-cols-[42px_1fr] gap-3">
          <div className="flex h-full flex-col-reverse justify-between pb-9 text-[11px] font-medium text-[#7f7369]">
            {axisLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="relative flex-1">
              <div className="absolute inset-0 flex flex-col justify-between">
                {axisLabels
                  .slice()
                  .reverse()
                  .map((label) => (
                    <span
                      key={label}
                      className="block border-t border-[#ece4dc]"
                    />
                  ))}
              </div>

              <div className="relative z-[1] flex h-full items-end justify-between gap-4 px-3">
                {chartPoints.map((point) => {
                  const height = Math.max(36, (point.value / maxValue) * 78);

                  return (
                    <div
                      key={point.label}
                      className="flex h-full flex-1 items-end justify-center"
                    >
                      <div
                        className="w-[44px] rounded-t-full bg-[#d96e39]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex justify-between gap-4 px-3 text-[11px] font-medium text-[#7f7369]">
              {chartPoints.map((point) => (
                <span key={point.label} className="flex-1 text-center">
                  {point.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
