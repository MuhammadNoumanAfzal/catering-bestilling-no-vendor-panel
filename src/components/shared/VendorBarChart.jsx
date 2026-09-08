import { useState } from "react";

function toFiniteNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("nb-NO", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function buildNiceTicks(maxValue, isCurrency = true) {
  const safeMaxValue = Math.max(0, toFiniteNumber(maxValue));

  if (safeMaxValue <= 0) {
    return [4, 3, 2, 1, 0];
  }

  const roughStep = safeMaxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;
  const niceMultiplier =
    normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  const baseStep = niceMultiplier * magnitude;
  const step = isCurrency ? Math.max(100, Math.ceil(baseStep / 100) * 100) : Math.max(1, Math.ceil(baseStep));
  const upperBound = step * 4;

  return Array.from({ length: 5 }, (_, index) => upperBound - step * index);
}

function defaultAxisFormatter(value, { isCurrency }) {
  return isCurrency ? `NOK ${formatCompactNumber(value)}` : formatCompactNumber(value);
}

function defaultTooltipFormatter(value, { isCurrency }) {
  if (!isCurrency) {
    return `${new Intl.NumberFormat("nb-NO").format(value)} orders`;
  }

  return `NOK ${new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)}`;
}

function buildTopRoundedBarPath({ x, y, width, height, radius = 10 }) {
  const safeRadius = Math.min(radius, width / 2, height);
  const bottomY = y + height;

  return [
    `M ${x} ${bottomY}`,
    `L ${x} ${y + safeRadius}`,
    `Q ${x} ${y} ${x + safeRadius} ${y}`,
    `L ${x + width - safeRadius} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + safeRadius}`,
    `L ${x + width} ${bottomY}`,
    "Z",
  ].join(" ");
}

export default function VendorBarChart({
  points = [],
  emptyMessage = "No chart data is available for the selected range.",
  emptyTitle = "No data available",
  formatAxisLabel = defaultAxisFormatter,
  formatTooltipValue = defaultTooltipFormatter,
  isCurrency = true,
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const chartPoints = Array.isArray(points)
    ? points.map((point, index) => ({
        label: `${point?.label ?? `Point ${index + 1}`}`.trim(),
        tooltipLabel: `${point?.tooltipLabel ?? point?.label ?? `Point ${index + 1}`}`.trim(),
        value: Math.max(0, toFiniteNumber(point?.value)),
      }))
    : [];
  const hasData = chartPoints.some((point) => point.value > 0);
  const ticks = buildNiceTicks(Math.max(...chartPoints.map((point) => point.value), 0), isCurrency);
  const chartMax = Math.max(ticks[0] || 1, 1);
  const chartHeight = 228;
  const leftPadding = 88;
  const rightPadding = 18;
  const topPadding = 18;
  const bottomPadding = 48;
  const innerWidth = 640 - leftPadding - rightPadding;
  const innerHeight = chartHeight - topPadding - bottomPadding;
  const barSlot = chartPoints.length ? innerWidth / chartPoints.length : innerWidth;
  const barWidth = Math.max(14, Math.min(44, barSlot * 0.42));
  const activePoint = activeIndex == null ? null : chartPoints[activeIndex];

  if (!chartPoints.length || !hasData) {
    return (
      <div className="mt-4 flex min-h-[232px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#ded3ca] bg-[#fbf8f5] px-5 py-6 text-center">
        <p className="m-0 text-[14px] font-bold text-[#675a50]">{emptyTitle}</p>
        <p className="mt-1 max-w-[320px] text-[12px] leading-5 text-[#8d8177]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-[10px] border border-[#e6ddd5] bg-[#fffdfb] p-3">
      <div className="w-full overflow-x-auto pb-1">
        <svg
          aria-label="Revenue chart"
          className="min-w-[560px]"
          role="img"
          viewBox={`0 0 640 ${chartHeight}`}
        >
          {ticks.map((tick) => {
            const y = topPadding + innerHeight - (tick / chartMax) * innerHeight;

            return (
              <g key={tick}>
                <line
                  stroke="#eee6de"
                  strokeDasharray="3 4"
                  x1={leftPadding}
                  x2={leftPadding + innerWidth}
                  y1={y}
                  y2={y}
                />
                <text
                  fill="#75695f"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="end"
                  x={leftPadding - 12}
                  y={y + 4}
                >
                  {formatAxisLabel(tick, { isCurrency })}
                </text>
              </g>
            );
          })}

          {chartPoints.map((point, index) => {
            const height = Math.max(8, (point.value / chartMax) * innerHeight);
            const x = leftPadding + index * barSlot + (barSlot - barWidth) / 2;
            const y = topPadding + innerHeight - height;
            const labelX = leftPadding + index * barSlot + barSlot / 2;

            return (
              <g
                key={`${point.label}-${index}`}
                className="cursor-pointer outline-none"
                onBlur={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                tabIndex={0}
              >
                <path
                  d={buildTopRoundedBarPath({ x, y, width: barWidth, height })}
                  fill={activeIndex === index ? "#bf5728" : "#d96e39"}
                  style={{ transition: "fill 150ms ease, opacity 150ms ease" }}
                />
                <text
                  fill="#5f534a"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  x={labelX}
                  y={topPadding + innerHeight + 24}
                >
                  {point.label}
                </text>
              </g>
            );
          })}

          {activePoint ? (() => {
            const tooltipWidth = 132;
            const tooltipHeight = 52;
            const index = activeIndex;
            const height = Math.max(8, (activePoint.value / chartMax) * innerHeight);
            const labelX = leftPadding + index * barSlot + barSlot / 2;
            const barTopY = topPadding + innerHeight - height;
            const x = Math.min(
              640 - tooltipWidth - 8,
              Math.max(8, labelX - tooltipWidth / 2),
            );
            const y = Math.max(6, barTopY - tooltipHeight - 10);

            return (
              <g className="pointer-events-none">
                <rect
                  fill="#20140f"
                  height={tooltipHeight}
                  rx="8"
                  width={tooltipWidth}
                  x={x}
                  y={y}
                />
                <path
                  d={`M ${labelX - 6} ${y + tooltipHeight - 1} L ${labelX} ${y + tooltipHeight + 7} L ${labelX + 6} ${y + tooltipHeight - 1} Z`}
                  fill="#20140f"
                />
                <text
                  fill="#fff4ec"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  x={x + tooltipWidth / 2}
                  y={y + 18}
                >
                  {activePoint.tooltipLabel || activePoint.label}
                </text>
                <text
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="800"
                  textAnchor="middle"
                  x={x + tooltipWidth / 2}
                  y={y + 36}
                >
                  {formatTooltipValue(activePoint.value, { isCurrency })}
                </text>
              </g>
            );
          })() : null}
        </svg>
      </div>
    </div>
  );
}
