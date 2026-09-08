import VendorBarChart from "../../../components/shared/VendorBarChart";

function extractNumericAmount(label) {
  const numericValue = Number(String(label || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export default function EarningChart({
  values,
  subtitle,
  emptyTitle = "No data available",
  emptyMessage = "No earnings data is available for the selected range.",
}) {
  const chartPoints = Array.isArray(values)
    ? values.map((item) => ({
        label: item.month,
        tooltipLabel: item.tooltipLabel || item.month,
        value: Number.isFinite(Number(item.rawValue))
          ? Number(item.rawValue)
          : extractNumericAmount(item.amountLabel),
      }))
    : [];

  return (
    <>
      {subtitle ? <p className="type-para -mt-1">{subtitle}</p> : null}
      <VendorBarChart
        emptyMessage={emptyMessage}
        emptyTitle={emptyTitle}
        points={chartPoints}
      />
    </>
  );
}
