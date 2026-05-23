import { useMemo, useState } from "react";
import NotificationDetailModal from "../components/NotificationDetailModal";
import NotificationReceiptModal from "../components/NotificationReceiptModal";
import NotificationSection from "../components/NotificationSection";
import NotificationsToolbar from "../components/NotificationsToolbar";
import {
  defaultCustomRange,
  notificationFilterOptions,
  notificationSections,
  notificationTabs,
} from "../data/notificationsData";

function formatFilterDate(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const [year, month, day] = dateValue.split("-");
  return `${day}-${month}-${year}`;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("Custom Date");
  const [customRange, setCustomRange] = useState(defaultCustomRange);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detailNotification, setDetailNotification] = useState(null);
  const [receiptNotification, setReceiptNotification] = useState(null);

  const allNotifications = useMemo(
    () => notificationSections.flatMap((section) => section.items),
    [],
  );

  const filterLabel = useMemo(() => {
    if (selectedFilter === "Custom Date") {
      return `From: ${formatFilterDate(customRange.from)}  To: ${formatFilterDate(customRange.to)}`;
    }

    return selectedFilter;
  }, [customRange.from, customRange.to, selectedFilter]);

  const filteredSections = useMemo(() => {
    let startDate = null;

    if (selectedFilter === "Last Month") {
      startDate = "2026-04-23";
    } else if (selectedFilter === "Last 3 Months") {
      startDate = "2026-02-23";
    } else if (selectedFilter === "Last 6 Months") {
      startDate = "2025-11-23";
    } else if (selectedFilter === "This Year") {
      startDate = "2026-01-01";
    }

    return notificationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchesTab =
            activeTab === "Unread"
              ? !item.isRead
              : activeTab === "Read"
                ? item.isRead
                : true;

          if (!matchesTab) {
            return false;
          }

          if (selectedFilter === "Custom Date") {
            return item.date >= customRange.from && item.date <= customRange.to;
          }

          return startDate ? item.date >= startDate : true;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [activeTab, customRange.from, customRange.to, selectedFilter]);

  function handleCustomRangeChange(field, value) {
    setCustomRange((currentRange) => {
      const nextRange = {
        ...currentRange,
        [field]: value,
      };

      if (field === "from" && nextRange.to < value) {
        nextRange.to = value;
      }

      if (field === "to" && nextRange.from > value) {
        nextRange.from = value;
      }

      return nextRange;
    });
  }

  function handleSelectFilter(option) {
    setSelectedFilter(option);

    if (option !== "Custom Date") {
      setIsFilterOpen(false);
    }
  }

  function handleOpenDetail(notification) {
    setDetailNotification(notification);
  }

  function handleOpenReceipt(notification) {
    setReceiptNotification(notification);
  }

  return (
    <section className="mx-auto w-full px-5 py-5">
      <header className="mb-4">
        <div className="flex items-start justify-between gap-4 max-[760px]:flex-col">
          <div>
            <h1 className="type-h2 m-0 text-[#1c1510]">Notifications</h1>
            <p className="type-para mt-1 text-[#8b7f74]">
              Track important operational updates and customer activity in real
              time.
            </p>
          </div>

          <span className="type-subpara rounded-full bg-white px-3 py-[8px] text-[#7d6f63] shadow-[0_2px_10px_rgba(45,31,20,0.04)]">
            {filteredSections.reduce(
              (total, section) => total + section.items.length,
              0,
            )}{" "}
            of {allNotifications.length} notifications
          </span>
        </div>
      </header>

      <NotificationsToolbar
        activeTab={activeTab}
        customRange={customRange}
        filterLabel={filterLabel}
        filterOptions={notificationFilterOptions}
        isFilterOpen={isFilterOpen}
        onCustomRangeChange={handleCustomRangeChange}
        onFilterToggle={() => setIsFilterOpen((currentValue) => !currentValue)}
        onSelectFilter={handleSelectFilter}
        onTabChange={setActiveTab}
        selectedFilter={selectedFilter}
        setIsFilterOpen={setIsFilterOpen}
        tabs={notificationTabs}
      />

      <div className="mt-4 flex flex-col gap-4">
        {filteredSections.length ? (
          filteredSections.map((section) => (
            <NotificationSection
              key={section.id}
              items={section.items}
              label={section.label}
              onOpenDetail={handleOpenDetail}
              onOpenReceipt={handleOpenReceipt}
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

      <NotificationDetailModal
        notification={detailNotification}
        onClose={() => setDetailNotification(null)}
      />

      <NotificationReceiptModal
        notification={receiptNotification}
        onClose={() => setReceiptNotification(null)}
      />
    </section>
  );
}
