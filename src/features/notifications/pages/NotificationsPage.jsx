import NotificationSection from "../components/NotificationSection";
import NotificationsToolbar from "../components/NotificationsToolbar";
import {
  notificationFilterOptions,
  notificationTabs,
} from "../data/notificationsData";
import useNotificationsPageState from "../hooks/useNotificationsPageState";

export default function NotificationsPage() {
  const {
    activeTab,
    customRange,
    filterLabel,
    handleCustomRangeChange,
    handleLoadMore,
    handleMarkAllRead,
    handleOpenNotification,
    handleSelectFilter,
    isFilterOpen,
    isLoading,
    isLoadingMore,
    isMarkingAllRead,
    notificationsCount,
    pageInfo,
    sections,
    selectedFilter,
    setActiveTab,
    setIsFilterOpen,
    totalCount,
    unreadCount,
  } = useNotificationsPageState();

  return (
    <section className="mx-auto w-full px-5 py-5">
      <header className="mb-5 rounded-[24px] border border-[#eadfd6] bg-[linear-gradient(135deg,#fffdfb_0%,#fff6ef_100%)] px-5 py-5 shadow-[0_14px_34px_rgba(45,31,20,0.05)]">
        <div className="flex items-start justify-between gap-4 max-[760px]:flex-col">
          <div>
            <h1 className="type-h2 m-0 text-[#1c1510]">Notifications</h1>
            <p className="type-para mt-1 max-w-2xl text-[#8b7f74]">
              Track important operational updates and customer activity in real
              time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-2 text-[12px] font-semibold text-[#7d6f63] shadow-[0_4px_14px_rgba(45,31,20,0.05)]">
              {totalCount} total
            </span>
            <span className="rounded-full bg-[#fff0e6] px-3 py-2 text-[12px] font-semibold text-[#cf6e38] shadow-[0_4px_14px_rgba(45,31,20,0.04)]">
              {unreadCount} unread
            </span>
          </div>
        </div>
      </header>

      <NotificationsToolbar
        activeTab={activeTab}
        customRange={customRange}
        filterLabel={filterLabel}
        filterOptions={notificationFilterOptions}
        isFilterOpen={isFilterOpen}
        isMarkingAllRead={isMarkingAllRead}
        onCustomRangeChange={handleCustomRangeChange}
        onFilterToggle={() => setIsFilterOpen((currentValue) => !currentValue)}
        onMarkAllRead={handleMarkAllRead}
        onSelectFilter={handleSelectFilter}
        onTabChange={setActiveTab}
        selectedFilter={selectedFilter}
        setIsFilterOpen={setIsFilterOpen}
        tabs={notificationTabs}
        unreadCount={unreadCount}
      />

      <div className="mt-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[18px] border border-[#eadfd6] bg-white p-4 shadow-[0_8px_24px_rgba(45,31,20,0.04)]"
              >
                <div className="h-5 w-32 animate-pulse rounded bg-[#eadfd6]" />
                <div className="mt-3 space-y-3">
                  <div className="h-20 animate-pulse rounded bg-[#f4ede7]" />
                  <div className="h-20 animate-pulse rounded bg-[#f4ede7]" />
                </div>
              </div>
            ))}
          </div>
        ) : sections.length ? (
          sections.map((section) => (
            <NotificationSection
              key={section.id}
              items={section.items}
              label={section.label}
              onOpen={handleOpenNotification}
            />
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#ded3ca] bg-[linear-gradient(180deg,#fffdfb_0%,#ffffff_100%)] px-6 py-12 text-center shadow-[0_10px_24px_rgba(45,31,20,0.03)]">
            <h2 className="text-[20px] font-semibold text-[#241c17]">
              No notifications yet
            </h2>
            <p className="mt-2 text-[14px] text-[#7e7268]">
              Try another filter or check back when new order and review activity comes in.
            </p>
          </div>
        )}
      </div>

      {pageInfo.hasNextPage ? (
        <div className="mt-5 flex justify-center">
          <button
            className="type-subpara rounded-[9px] border border-[#ddcfc4] bg-white px-4 py-[10px] text-[#332821] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoadingMore}
            onClick={handleLoadMore}
            type="button"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
