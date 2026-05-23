import NotificationFilterDropdown from "./NotificationFilterDropdown";

export default function NotificationsToolbar({
  activeTab,
  customRange,
  filterLabel,
  filterOptions,
  isFilterOpen,
  onCustomRangeChange,
  onFilterToggle,
  onSelectFilter,
  onTabChange,
  selectedFilter,
  setIsFilterOpen,
  tabs,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#e2d8d0] bg-white px-3 py-2 shadow-[0_2px_10px_rgba(45,31,20,0.04)] max-[640px]:flex-col max-[640px]:items-stretch">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              className={`type-h6 rounded-[9px] px-3 py-[7px] transition ${
                isActive
                  ? "bg-[#d86f39] text-white shadow-[0_6px_16px_rgba(216,111,57,0.22)]"
                  : "border border-[#e2d8d0] bg-white"
              }`}
              onClick={() => onTabChange(tab)}
              type="button"
            >
              {tab}
            </button>
          );
        })}
      </div>

      <NotificationFilterDropdown
        customRange={customRange}
        filterLabel={filterLabel}
        isOpen={isFilterOpen}
        onCustomRangeChange={onCustomRangeChange}
        onSelectFilter={onSelectFilter}
        onToggle={onFilterToggle}
        options={filterOptions}
        selectedFilter={selectedFilter}
        setIsOpen={setIsFilterOpen}
      />
    </div>
  );
}
