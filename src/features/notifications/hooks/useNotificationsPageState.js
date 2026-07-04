import { useEffect, useMemo, useState } from "react";
import {
  getVendorNotificationDetail,
  getVendorNotifications,
  markAllVendorNotificationsAsRead,
} from "../api/notificationsApi";
import {
  buildFilterLabel,
  createDefaultCustomRange,
  groupNotificationsByLabel,
  mapFilterToQueryVariables,
  mapNotificationsConnection,
  mapNotificationNode,
  mapTabToStatus,
} from "../api/notificationsMappers";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30000;

export default function useNotificationsPageState() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("Last Month");
  const [customRange, setCustomRange] = useState(createDefaultCustomRange);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedModalType, setSelectedModalType] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const filterVariables = useMemo(
    () => mapFilterToQueryVariables(selectedFilter, customRange),
    [selectedFilter, customRange],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadNotifications({ silent = false } = {}) {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const result = await getVendorNotifications({
          status: mapTabToStatus(activeTab),
          first: PAGE_SIZE,
          after: null,
          ...filterVariables,
        });

        if (isCancelled) return;

        const mapped = mapNotificationsConnection(result?.vendorNotifications);
        setNotifications(mapped.items);
        setPageInfo(mapped.pageInfo);
        setTotalCount(mapped.totalCount);
        setUnreadCount(mapped.unreadCount);
      } catch (error) {
        if (!isCancelled && !silent) {
          await showVendorErrorAlert(
            error.message || "Unable to load notifications right now.",
            "Notifications unavailable",
          );
        }
      } finally {
        if (!isCancelled && !silent) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadNotifications({ silent: true });
      }
    }, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadNotifications({ silent: true });
      }
    }

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeTab, filterVariables]);

  const sections = useMemo(
    () => groupNotificationsByLabel(notifications),
    [notifications],
  );

  const filterLabel = useMemo(
    () => buildFilterLabel(selectedFilter, customRange),
    [selectedFilter, customRange],
  );

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

  async function handleOpenNotification(notification) {
    setSelectedModalType(notification.type === "PAYOUT" ? "receipt" : "detail");
    setSelectedNotification(notification);
    setIsDetailLoading(true);

    try {
      const result = await getVendorNotificationDetail(notification.id);
      const nextNotification = mapNotificationNode(result?.vendorNotification || notification);
      setSelectedNotification(nextNotification);
      setNotifications((current) => {
        if (activeTab === "Unread" && nextNotification.isRead) {
          return current.filter((item) => item.id !== nextNotification.id);
        }

        return current.map((item) =>
          item.id === nextNotification.id ? nextNotification : item,
        );
      });

      if (!notification.isRead && nextNotification.isRead) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to load the notification details.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleMarkAllRead() {
    if (!unreadCount) {
      return;
    }

    setIsMarkingAllRead(true);

    try {
      const result = await markAllVendorNotificationsAsRead();
      setNotifications((current) =>
        activeTab === "Unread"
          ? []
          : current.map((notification) => ({ ...notification, isRead: true })),
      );
      setUnreadCount(result.unreadCount ?? 0);
      await showVendorSuccessToast(result.message || "All notifications marked as read.");
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to mark notifications as read.",
      );
    } finally {
      setIsMarkingAllRead(false);
    }
  }

  async function handleLoadMore() {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const result = await getVendorNotifications({
        status: mapTabToStatus(activeTab),
        first: PAGE_SIZE,
        after: pageInfo.endCursor,
        ...filterVariables,
      });
      const mapped = mapNotificationsConnection(result?.vendorNotifications);
      setNotifications((current) => [...current, ...mapped.items]);
      setPageInfo(mapped.pageInfo);
      setTotalCount(mapped.totalCount);
      setUnreadCount(mapped.unreadCount);
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to load more notifications.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  return {
    activeTab,
    customRange,
    filterLabel,
    handleCloseModal: () => {
      setSelectedNotification(null);
      setSelectedModalType(null);
      setIsDetailLoading(false);
    },
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
    notificationsCount: notifications.length,
    pageInfo,
    sections,
    selectedFilter,
    selectedModalType,
    selectedNotification,
    setActiveTab,
    setIsFilterOpen,
    totalCount,
    unreadCount,
  };
}
