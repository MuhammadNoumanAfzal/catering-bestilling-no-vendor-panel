import NotificationDetailModal from "../components/NotificationDetailModal";
import NotificationReceiptModal from "../components/NotificationReceiptModal";
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
    handleCloseModal,
    handleCustomRangeChange,
    handleLoadMore,
    handleMarkAllRead,
    handleOpenNotification,
    handleSelectFilter,
    isDetailLoading,
    isFilterOpen,
    isLoading,
    isLoadingMore,
    isMarkingAllRead,
    notificationsCount,
    pageInfo,
    sections,
    selectedFilter,
    selectedModalType,
    selectedNotification,
    setActiveTab,
    setIsFilterOpen,
    totalCount,
    unreadCount,
  } = useNotificationsPageState();

  return (
    <section className="mx-auto w-full px-5 py-5">
      <header className="mb-4">
        <div className="flex items-start justify-between gap-4 max-[760px]:flex-col">
          <div>
            <h1 className="type-h2 m-0 text-[#1c1510]">Notifications</h1>
            <p className="type-para mt-1 text-[#8b7f74]">
              Trackkk important operational updates and customer activity in real
              time.
            </p>
          </div>

          <span className="type-subpara rounded-full bg-white px-3 py-[8px] text-[#7d6f63] shadow-[0_2px_10px_rgba(45,31,20,0.04)]">
            {notificationsCount} of {totalCount} notifications
          </span>
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
                className="rounded-[14px] border border-[#eadfd6] bg-white p-4"
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
          <div className="rounded-[14px] border border-dashed border-[#ded3ca] bg-white px-4 py-8 text-center">
            <p className="type-subpara m-0 text-[#7e7268]">
              No notifications found for this filter.
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

      <NotificationDetailModal
        isLoading={isDetailLoading}
        notification={selectedModalType === "detail" ? selectedNotification : null}
        onClose={handleCloseModal}
      />

      <NotificationReceiptModal
        isLoading={isDetailLoading}
        notification={selectedModalType === "receipt" ? selectedNotification : null}
        onClose={handleCloseModal}
      />
    </section>
  );
}
