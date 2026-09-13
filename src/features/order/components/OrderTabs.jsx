import { useTranslation } from "react-i18next";
import DateRangeDropdown from "../../dashboard/components/DateRangeDropdown";

const tabKeyByLabel = {
  All: "all",
  Upcoming: "upcoming",
  Pending: "pending",
  New: "new",
  Accepted: "accepted",
  Preparing: "preparing",
  Ready: "ready",
  "Out for delivery": "outForDelivery",
  Delivered: "delivered",
  Canceled: "canceled",
  Modified: "modified",
};

function translateTabLabel(label, t) {
  return t(`orders.${tabKeyByLabel[label] || "status"}`, { defaultValue: label });
}

export default function OrderTabs({
  tabs,
  activeTab,
  onTabChange,
  filterDisabled = false,
  filterDisabledLabel = "",
  selectedFilter,
  onFilterSelect,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}) {
  const { t } = useTranslation();
  const orderedTabs = [
    ...tabs.filter((tab) => tab.label === "All"),
    ...tabs.filter((tab) => tab.label !== "All"),
  ];

  function handleDateRangeChange(option, startDate = "", endDate = "") {
    const nextOption = option || "All Time";

    if (nextOption === "Custom Date") {
      onFromDateChange(startDate);
      onToDateChange(endDate);
      onFilterSelect("Custom Date", startDate, endDate);
      return;
    }

    onFromDateChange("");
    onToDateChange("");
    onFilterSelect(nextOption, "", "");
  }

  return (
    <div className="rounded-[10px] border border-[#ddd4cb] bg-white px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 max-[960px]:flex-col max-[960px]:items-start">
        <div
          className="flex flex-1 items-center gap-4 pr-1 max-[720px]:w-full max-[720px]:overflow-x-auto hide-scrollbar max-[720px]:gap-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {orderedTabs.map((tab) => (
            <button
              key={tab.label}
              className={[
                "type-h5 cursor-pointer inline-flex shrink-0 items-center justify-center rounded-[7px] border-0 px-3 py-[6px] text-[14px] font-semibold leading-[1.2]",
                activeTab === tab.label
                  ? "bg-[#cf6e38] text-white"
                  : "bg-transparent text-[#1f1914]",
              ].join(" ")}
              onClick={() => onTabChange(tab.label)}
              type="button"
            >
              {translateTabLabel(tab.label, t)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 max-[720px]:w-full max-[720px]:justify-end">
          {filterDisabled ? (
            <div className="type-para inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-[12px] border border-[#f1dccf] bg-[#fff5ef] px-4 font-medium text-[#b7653f]">
              {filterDisabledLabel || t("orders.liveFilterActive", { defaultValue: "Live filter active" })}
            </div>
          ) : (
            <DateRangeDropdown
              initialEnd={toDate}
              initialOption={selectedFilter || "All Time"}
              initialStart={fromDate}
              onChange={handleDateRangeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}