import { useMemo, useState } from "react";

const fallbackLabels = ["Point 1", "Point 2", "Point 3", "Point 4"];

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatAxisValue(value, isOrdersView) {
  if (isOrdersView) {
    return formatCompactNumber(value);
  }

  return `NOK ${formatCompactNumber(value)}`;
}

function formatPointLabel(label) {
  if (!label) {
    return "";
  }

  const parsedDate = new Date(label);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  }

  return String(label).replace(/[_-]/g, " ");
}

function buildAxisTicks(maxValue, isOrdersView) {
  const safeMaxValue = Math.max(maxValue, 0);
  const rawStep = safeMaxValue > 0 ? safeMaxValue / 4 : 0;
  const step = isOrdersView
    ? Math.max(1, Math.ceil(rawStep))
    : Math.max(100, Math.ceil(rawStep / 100) * 100);

  const upperBound = step * 4;

  return Array.from({ length: 5 }, (_, index) => {
    const value = upperBound - step * index;
    return {
      value,
      label: formatAxisValue(value, isOrdersView),
    };
  });
}

export default function FinanceChartCard({ points }) {
  const [activeTab, setActiveTab] = useState("earning");
  const isOrdersView = activeTab === "orders";
  const chartPoints = useMemo(
    () =>
      (Array.isArray(points) && points.length ? points : fallbackLabels.map((label) => ({ label }))).map(
        (point) => ({
          label: formatPointLabel(point?.label),
          value: Math.max(
            0,
            isOrdersView ? Number(point?.orders) || 0 : Number(point?.earnings) || 0,
          ),
        }),
      ),
    [isOrdersView, points],
  );
  const hasLiveData = Array.isArray(points) && points.length > 0;
  const maxValue = Math.max(...chartPoints.map((point) => point.value), 0);
  const axisTicks = buildAxisTicks(maxValue, isOrdersView);
  const chartMaxValue = axisTicks[0]?.value || 1;

  return (
    <section className="flex h-full min-h-[428px] flex-col rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-3 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-h3 m-0 text-[#181310]">Earning Overview</h2>
          <p className="type-para mt-1 text-[#6f6258]">
            Revenue and order performance for the selected range
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
        <div className="grid min-h-[320px] w-full grid-cols-[68px_1fr] gap-3">
          <div className="flex h-full flex-col justify-between pb-9 text-[11px] font-medium text-[#7f7369]">
            {axisTicks.map((tick) => (
              <span key={tick.value}>{tick.label}</span>
            ))}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="relative flex-1">
              <div className="absolute inset-0 flex flex-col justify-between">
                {axisTicks.map((tick) => (
                  <span
                    key={`grid-${tick.value}`}
                    className="block border-t border-[#ece4dc]"
                  />
                ))}
              </div>

              <div className="relative z-[1] flex h-full items-end justify-between gap-4 px-3">
                {chartPoints.map((point, index) => {
                  const height = chartMaxValue > 0 ? (point.value / chartMaxValue) * 100 : 0;

                  return (
                    <div
                      key={`${point.label || "point"}-${index}`}
                      className="flex h-full flex-1 items-end justify-center"
                      title={`${point.label}: ${formatAxisValue(point.value, isOrdersView)}`}
                    >
                      <div
                        className={`min-h-[8px] w-[44px] rounded-t-full ${
                          hasLiveData ? "bg-[#d96e39]" : "bg-[#f1c7b1]"
                        }`}
                        style={{ height: `${Math.max(height, 8)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex justify-between gap-4 px-3 text-[11px] font-medium text-[#7f7369]">
              {chartPoints.map((point, index) => (
                <span
                  key={`${point.label || "label"}-${index}`}
                  className="flex-1 truncate text-center"
                  title={point.label}
                >
                  {point.label || `Point ${index + 1}`}
                </span>
              ))}
            </div>

            {!hasLiveData ? (
              <p className="mt-3 px-3 text-center text-[12px] font-medium text-[#8b7d72]">
                No chart data is available for the selected date range.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
