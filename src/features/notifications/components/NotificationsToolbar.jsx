import NotificationFilterDropdown from "./NotificationFilterDropdown";

export default function NotificationsToolbar({
  activeTab,
  customRange,
  filterLabel,
  filterOptions,
  isFilterOpen,
  isMarkingAllRead = false,
  unreadCount = 0,
  onCustomRangeChange,
  onFilterToggle,
  onMarkAllRead,
  onSelectFilter,
  onTabChange,
  selectedFilter,
  setIsFilterOpen,
  tabs,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e8ddd4] bg-white px-3 py-3 shadow-[0_10px_24px_rgba(45,31,20,0.05)] max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="flex min-w-0 flex-wrap items-center gap-2 max-[480px]:grid max-[480px]:grid-cols-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                isActive
                  ? "bg-[#cf6e38] text-white shadow-[0_8px_18px_rgba(207,110,56,0.22)]"
                  : "border border-[#e4d8cf] bg-[#fffdfa] text-[#5d5147] hover:border-[#d7c8bc] hover:bg-[#faf5f0]"
              } max-[480px]:min-w-0 max-[480px]:w-full`}
              onClick={() => onTabChange(tab)}
              type="button"
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 items-center gap-2 max-[760px]:w-full max-[760px]:flex-col max-[760px]:items-stretch">
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

        <button
          className="rounded-full border border-[#e4d8cf] bg-[#fffdfa] px-4 py-2 text-[13px] font-semibold text-[#453930] transition hover:border-[#cf6e38] hover:text-[#cf6e38] disabled:cursor-not-allowed disabled:opacity-50 max-[760px]:w-full"
          disabled={isMarkingAllRead || !unreadCount}
          onClick={onMarkAllRead}
          type="button"
        >
          {isMarkingAllRead ? "Marking..." : "Mark All Read"}
        </button>
      </div>
    </div>
  );
}
