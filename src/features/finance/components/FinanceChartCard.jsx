import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import VendorBarChart from "../../../components/shared/VendorBarChart";

function formatPointLabel(label) {
  if (!label) {
    return "";
  }

  const parsedDate = new Date(label);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString("en-GB", {
      weekday: "short",
    });
  }

  return String(label).replace(/[_-]/g, " ");
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("nb-NO", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatAxisLabel(value, { isCurrency }) {
  return isCurrency ? `NOK ${formatCompactNumber(value)}` : formatCompactNumber(value);
}

function formatTooltipValue(value, { isCurrency }) {
  if (!isCurrency) {
    return `${new Intl.NumberFormat("nb-NO").format(value)} orders`;
  }

  return `NOK ${new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)}`;
}

export default function FinanceChartCard({ points }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("earning");
  const isOrdersView = activeTab === "orders";
  const chartPoints = useMemo(
    () =>
      (Array.isArray(points) ? points : []).map((point) => ({
        label: formatPointLabel(point?.label),
        tooltipLabel: formatPointLabel(point?.label),
        value: Math.max(
          0,
          isOrdersView ? Number(point?.orders) || 0 : Number(point?.earnings) || 0,
        ),
      })),
    [isOrdersView, points],
  );

  return (
    <section className="flex h-full min-h-[420px] flex-col rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-3 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="mb-3 flex items-start justify-between gap-3 max-[560px]:flex-col max-[560px]:items-stretch">
        <div>
          <h2 className="type-h3 m-0 text-[#181310]">
            {t("finance.earningsOverview", { defaultValue: "Earnings Overview" })}
          </h2>
          <p className="type-para mt-1 text-[#6f6258]">
            {t("finance.chartDescription", { defaultValue: "Revenue and order performance for the selected range" })}
          </p>
        </div>

        <div className="flex items-center gap-1 self-start rounded-[10px] border border-[#e4dbd3] bg-[#faf7f4] p-1 max-[560px]:self-end">
          <button
            className={`cursor-pointer rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
              !isOrdersView
                ? "bg-[#d96e39] text-white shadow-[0_4px_10px_rgba(217,110,57,0.18)]"
                : "text-[#6f6258] hover:bg-white"
            }`}
            onClick={() => setActiveTab("earning")}
            type="button"
          >
            {t("finance.earnings", { defaultValue: "Earnings" })}
          </button>
          <button
            className={`cursor-pointer rounded-[8px] px-3 py-1.5 text-[11px] font-bold transition ${
              isOrdersView
                ? "bg-[#d96e39] text-white shadow-[0_4px_10px_rgba(217,110,57,0.18)]"
                : "text-[#6f6258] hover:bg-white"
            }`}
            onClick={() => setActiveTab("orders")}
            type="button"
          >
            {t("finance.orders", { defaultValue: "Orders" })}
          </button>
        </div>
      </div>

      <VendorBarChart
        emptyMessage={t("finance.noChart", {
          defaultValue: "No chart data is available for the selected date range.",
        })}
        emptyTitle={t("dashboard.chart.noData", { defaultValue: "No data available" })}
        formatAxisLabel={formatAxisLabel}
        formatTooltipValue={formatTooltipValue}
        isCurrency={!isOrdersView}
        points={chartPoints}
      />
    </section>
  );
}
