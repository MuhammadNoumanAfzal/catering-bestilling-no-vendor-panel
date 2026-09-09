import {
  Bell,
  ChevronDown,
  X,
  Grid2x2,
  LifeBuoy,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  ShoppingBag,
  Truck,
  Utensils,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { confirmVendorLogout, showNewNotificationToast } from "../../utils/vendorAlerts";
import {
  VENDOR_PROFILE_UPDATED_EVENT,
  withImageCacheBuster,
} from "../../utils/vendorProfileEvents";
import {
  getVendorNotifications,
} from "../../features/notifications/api/notificationsApi";
import { getVendorSettingsPage } from "../../features/settings/api/settingsApi";
import { getVendorOrdersPage } from "../../features/order/api/orderApi";
import { getVendorMenus } from "../../features/menu/api/menuApi";

const sidebarItems = [
  { label: "Dashboard", to: "/dashboard", icon: Grid2x2 },
  { label: "Orders", to: "/orders", icon: ShoppingBag },
  { label: "Menu", to: "/menu", icon: Utensils },
  { label: "Delivery", to: "/delivery", icon: Truck },
  { label: "Finance", to: "/finance", icon: Wallet },
  { label: "Reviews", to: "/reviews", icon: MessageSquareText },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Support", to: "/support", icon: LifeBuoy },
  { label: "Settings", to: "/settings", icon: Settings },
];

const NOTIFICATION_POLL_INTERVAL_MS = 10000;
const LAST_SEEN_VENDOR_NOTIFICATION_KEY = "vendor-last-seen-notification-id";
const VENDOR_FINANCE_NOTIFICATION_EVENT = "vendor-finance-notification-received";

function readLastSeenVendorNotificationId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(LAST_SEEN_VENDOR_NOTIFICATION_KEY);
}

function writeLastSeenVendorNotificationId(notificationId) {
  if (typeof window === "undefined" || !notificationId) {
    return;
  }

  window.localStorage.setItem(LAST_SEEN_VENDOR_NOTIFICATION_KEY, notificationId);
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "V";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { pathname } = useLocation();
  const searchParamValue = searchParams.get("search") || "";
  const isSearchablePage = pathname === "/orders" || pathname === "/menu";
  const localSearch = isSearchablePage ? searchParamValue : headerSearch;
  const accountDisplayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Vendor User";
  const [businessDisplayName, setBusinessDisplayName] = useState("");
  const displayName = businessDisplayName || accountDisplayName;
  const displayRole = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : "Vendor";
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const prevLatestNotificationIdRef = useRef(null);
  const [isDesktopProfileMenuOpen, setIsDesktopProfileMenuOpen] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  const desktopProfileMenuRef = useRef(null);
  const mobileProfileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const profileInitials = getInitials(displayName);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfileImage(version = Date.now()) {
      try {
        const result = await getVendorSettingsPage();
        const settings = result?.vendorSettings;
        const nextBusinessName = settings?.businessProfile?.businessName || "";
        const nextProfileImageUrl = withImageCacheBuster(
          settings?.account?.avatar?.fileUrl ||
            settings?.businessProfile?.profileImage?.fileUrl ||
            settings?.logoUrl ||
            "",
          version,
        );

        if (!isCancelled) {
          setBusinessDisplayName(nextBusinessName);
          setProfileImageUrl(nextProfileImageUrl);
        }
      } catch {
        if (!isCancelled) {
          setBusinessDisplayName("");
          setProfileImageUrl("");
        }
      }
    }

    loadProfileImage();

    function handleVendorProfileUpdated(event) {
      const nextBusinessName = String(event?.detail?.businessName || "").trim();
      const nextImageUrl = withImageCacheBuster(
        event?.detail?.profileImageUrl,
        event?.detail?.version,
      );

      if (nextBusinessName) {
        setBusinessDisplayName(nextBusinessName);
      }

      if (nextImageUrl) {
        setProfileImageUrl(nextImageUrl);
        return;
      }

      loadProfileImage(event?.detail?.version || Date.now());
    }

    window.addEventListener(VENDOR_PROFILE_UPDATED_EVENT, handleVendorProfileUpdated);

    return () => {
      isCancelled = true;
      window.removeEventListener(VENDOR_PROFILE_UPDATED_EVENT, handleVendorProfileUpdated);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadNotificationCounts() {
      try {
        const result = await getVendorNotifications({ first: 200, status: null });
        const connection = result?.vendorFinanceNotifications;
        const unreadCount = Number(connection?.unreadCount ?? 0) || 0;
        const latestNotification = connection?.edges?.[0]?.node || null;
        const latestNotificationId = latestNotification?.id || null;
        const lastSeenNotificationId = readLastSeenVendorNotificationId();

        if (!isCancelled) {
          setUnreadNotificationsCount(unreadCount);

          if (
            latestNotificationId &&
            latestNotificationId !== prevLatestNotificationIdRef.current &&
            latestNotificationId !== lastSeenNotificationId &&
            latestNotification?.isRead === false
          ) {
            const title = latestNotification?.title || "New Notification";
            const message =
              latestNotification?.message || "You have received a new update.";
            showNewNotificationToast(title, message).then((result) => {
              if (result.isConfirmed) {
                navigate("/notifications");
              }
            });
            writeLastSeenVendorNotificationId(latestNotificationId);

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent(VENDOR_FINANCE_NOTIFICATION_EVENT, {
                  detail: { notification: latestNotification },
                }),
              );
            }
          }

          prevLatestNotificationIdRef.current = latestNotificationId;
        }
      } catch {
        if (!isCancelled) {
          setUnreadNotificationsCount(0);
        }
      }
    }

    loadNotificationCounts();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadNotificationCounts();
      }
    }, NOTIFICATION_POLL_INTERVAL_MS);

    function handleRefreshCounts() {
      if (document.visibilityState === "visible") {
        loadNotificationCounts();
      }
    }

    window.addEventListener("focus", handleRefreshCounts);
    document.addEventListener("visibilitychange", handleRefreshCounts);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleRefreshCounts);
      document.removeEventListener("visibilitychange", handleRefreshCounts);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        desktopProfileMenuRef.current &&
        !desktopProfileMenuRef.current.contains(event.target)
      ) {
        setIsDesktopProfileMenuOpen(false);
      }

      if (
        mobileProfileMenuRef.current &&
        !mobileProfileMenuRef.current.contains(event.target)
      ) {
        setIsMobileProfileMenuOpen(false);
      }

      if (!searchRef.current?.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value;
    setHeaderSearch(val);

    if (isSearchablePage) {
      if (val) {
        setSearchParams({ ...Object.fromEntries(searchParams.entries()), search: val });
      } else {
        const nextParams = Object.fromEntries(searchParams.entries());
        delete nextParams.search;
        setSearchParams(nextParams);
      }
    } else {
      if (val) {
        navigate(`/orders?search=${encodeURIComponent(val)}`);
      }
    }
  }

  function handleClearSearch() {
    setHeaderSearch("");

    if (isSearchablePage) {
      const nextParams = Object.fromEntries(searchParams.entries());
      delete nextParams.search;
      setSearchParams(nextParams);
      return;
    }
  }

  useEffect(() => {
    const query = localSearch.trim();

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return undefined;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        const [ordersResponse, menusResponse] = await Promise.all([
          getVendorOrdersPage({ first: 6, search: query }),
          getVendorMenus({ first: 50 }),
        ]);
        if (isCancelled) return;

        const orderResults = (ordersResponse?.vendorOrders?.edges || [])
          .map((edge) => edge?.node)
          .filter((order) => order?.id)
          .map((order) => ({
            id: `order-${order.id}`,
            label: order.invoiceNumber || order.orderNumber || `Order ${order.id}`,
            description: ["Order", order.customerName, order.eventName].filter(Boolean).join(" â€¢ "),
            to: `/orders/${encodeURIComponent(order.id)}`,
          }));
        const menuResults = (menusResponse?.vendorMenus?.edges || [])
          .map((edge) => edge?.node)
          .filter((menu) => [menu?.name, menu?.description].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
          .map((menu) => ({
            id: `menu-${menu.id}`,
            label: menu.name || "Menu item",
            description: "Menu",
            to: `/menu/create?mode=view&id=${encodeURIComponent(menu.id)}`,
          }));

        setSearchResults([...orderResults, ...menuResults]);
      } catch {
        if (!isCancelled) setSearchResults([]);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [localSearch]);

  async function handleLogout() {
    const result = await confirmVendorLogout();

    if (result.isConfirmed) {
      setIsDesktopProfileMenuOpen(false);
      setIsMobileProfileMenuOpen(false);
      logout();
    }
  }

  function handleOpenNotifications() {
    setIsDesktopProfileMenuOpen(false);
    setIsMobileProfileMenuOpen(false);
    navigate("/notifications");
  }

  function renderProfileAvatar(sizeClass = "h-7 w-7", textClass = "text-[11px]") {
    if (profileImageUrl) {
      return (
        <img
          className={`${sizeClass} rounded-full object-cover ring-2 ring-[#f2ebe4]`}
          src={profileImageUrl}
          alt={displayName}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#cf6e38_0%,#e38a55_100%)] font-extrabold text-white ring-2 ring-[#f2ebe4] ${textClass}`}
        aria-label={displayName}
      >
        {profileInitials}
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#211f1f] text-[#201914]">
      <div className="min-h-screen w-full overflow-x-clip bg-[#f4f1ee] lg:grid lg:grid-cols-[236px_minmax(0,1fr)] max-[960px]:block">
      <aside className="relative flex min-h-screen w-[236px] flex-col bg-[linear-gradient(180deg,#cb6432_0%,#c55b2d_100%)] text-white max-[960px]:hidden lg:w-auto">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="mx-4 mt-4 rounded-[22px] border border-white/10 bg-white/12 px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <img className="block h-auto w-32 object-contain" src="/whiteLogo.png" alt="GoCatering" />
            <p className="type-subpara mt-3 text-white/75">Vendor dashboard</p>
          </div>

          <div className="flex-1 overflow-auto px-3 py-6 hide-scrollbar">
            <nav className="space-y-2" aria-label="Primary navigation">
              {sidebarItems.map(({ icon: Icon, label, to }) => {
                const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(`${to}/`));

                return (
                  <NavLink
                    key={label}
                    className={() =>
                      [
                        "group flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition",
                        active
                          ? "bg-[#fff3ec] text-[#c75f2e]"
                          : "text-white hover:bg-white/8",
                      ].join(" ")
                    }
                    to={to}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] transition">
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {label === "Notifications" && unreadNotificationsCount > 0 ? (
                      <span
                        className={[
                          "inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                          active ? "bg-[#c75f2e] text-white" : "bg-white/18 text-white",
                        ].join(" ")}
                      >
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="px-3 pb-4">
          <button
            className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/8"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[69px] items-center justify-between gap-4 border-b border-[#ebe4de] bg-white/92 px-5 py-3 backdrop-blur-xl max-[960px]:h-auto max-[960px]:flex-col max-[960px]:items-stretch max-[960px]:border-b-0 max-[960px]:bg-transparent max-[960px]:px-3 max-[960px]:pt-3">
          <div className="max-w-[520px] flex-1 max-[960px]:hidden">
            <div className="relative" ref={searchRef}>
              <input
                className="h-11 w-full rounded-full border border-transparent bg-[#f1f4f8] px-4 pl-11 pr-11 text-[12px] text-[#231913] outline-none transition placeholder:text-[#a9afba] focus:border-[#ebddd1] focus:bg-white focus:shadow-[0_0_0_4px_rgba(206,105,56,0.11)]"
                placeholder="Search orders, menu items, or customers..."
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
              />
              <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#adb3bd]" />
              {localSearch ? (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8f7f73] transition hover:bg-[#f6efe8] hover:text-[#241913]"
                  onClick={handleClearSearch}
                  type="button"
                >
                  <X size={16} />
                </button>
              ) : null}
              {isSearchFocused && localSearch.trim() ? (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[18px] border border-[#e8dfd8] bg-white shadow-[0_24px_60px_rgba(45,28,16,0.14)]">
                  {isSearching ? (
                    <p className="px-4 py-5 text-[12px] text-[#8c7f75]">Searching your orders and menu...</p>
                  ) : searchResults.length ? (
                    <div className="max-h-[320px] overflow-y-auto p-2">
                      {searchResults.map((result) => (
                        <button
                          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left transition hover:bg-[#faf4ee]"
                          key={result.id}
                          onClick={() => { setIsSearchFocused(false); navigate(result.to); }}
                          type="button"
                        >
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#fff1e8] text-[#cf6e38]"><Search size={16} /></span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold text-[#231913]">{result.label}</span><span className="block truncate text-[12px] text-[#7b6f66]">{result.description}</span></span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-5 text-[12px] text-[#8c7f75]">No matching orders or menu items found.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 border-l border-[#ebe4de] pl-3 max-[960px]:hidden">
            <button
              onClick={handleOpenNotifications}
              className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#2f241c] transition hover:bg-[#f5f1ed]"
              type="button"
            >
              <Bell size={16} />
              {unreadNotificationsCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#cf6e38] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                </span>
              ) : null}
            </button>

            <div className="relative" ref={desktopProfileMenuRef}>
              <button
                onClick={() => setIsDesktopProfileMenuOpen((current) => !current)}
                className="inline-flex cursor-pointer items-center gap-3 rounded-[14px] bg-white py-1 pl-2 pr-2 text-[#241913] transition hover:bg-[#faf6f2]"
                type="button"
              >
                {renderProfileAvatar()}
                <span className="flex flex-col items-start leading-[1.15]">
                  <strong className="text-[12px] font-bold">{displayName}</strong>
                  <span className="text-[11px] text-[#7f746d]">{displayRole}</span>
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isDesktopProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDesktopProfileMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[220px] rounded-[18px] border border-[#eadfd5] bg-white p-2 shadow-[0_18px_34px_rgba(38,23,14,0.12)]">
                  <div className="flex items-center gap-3 rounded-[14px] bg-[#faf6f2] px-3 py-3">
                    {renderProfileAvatar("h-11 w-11", "text-[14px]")}
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-extrabold text-[#211915]">{displayName}</p>
                      <p className="mt-1 text-[12px] font-medium text-[#8f7f73]">{accountDisplayName}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col gap-1">
                    <button
                      className="flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#4f433c] transition hover:bg-[#faf6f2]"
                      onClick={() => {
                        setIsDesktopProfileMenuOpen(false);
                        navigate("/settings");
                      }}
                      type="button"
                    >
                      <Settings size={15} />
                      <span>Settings</span>
                    </button>
                    <button
                      className="flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#c85e2f] transition hover:bg-[#fff4ee]"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden flex-col gap-3 max-[960px]:flex">
            <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#e57a45_0%,#cf6837_100%)] p-4 text-white shadow-[0_14px_28px_rgba(121,61,23,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <img className="block h-auto w-32 object-contain" src="/whiteLogo.png" alt="GoCatering" />
                <div className="flex items-center gap-2">
                  <button
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
                    onClick={() => navigate("/notifications")}
                    type="button"
                  >
                    <Bell size={16} />
                    {unreadNotificationsCount > 0 ? (
                      <span className="absolute right-1.5 top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#cf6e38] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    ) : null}
                  </button>
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 max-[480px]:flex-col max-[480px]:items-stretch">
                <div className="relative max-[480px]:w-full" ref={mobileProfileMenuRef}>
                  <button
                    onClick={() => setIsMobileProfileMenuOpen((current) => !current)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white px-2 pb-[5px] pl-[6px] pr-2 pt-[5px] text-[#241913] shadow-[0_10px_20px_rgba(38,23,14,0.08)] max-[480px]:w-full justify-between"
                    type="button"
                  >
                    {renderProfileAvatar()}
                    <span className="flex flex-col items-start leading-[1.15]">
                    <strong className="text-[12px] font-bold">{displayName}</strong>
                    <span className="text-[11px] text-[#7f746d]">{displayRole}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        isMobileProfileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isMobileProfileMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[220px] rounded-[18px] border border-[#eadfd5] bg-white p-2 text-[#241913] shadow-[0_18px_34px_rgba(38,23,14,0.12)] max-[480px]:left-0">
                      <div className="mb-2 flex items-center gap-3 rounded-[14px] bg-[#faf6f2] px-3 py-3">
                        {renderProfileAvatar("h-11 w-11", "text-[14px]")}
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-extrabold text-[#211915]">{displayName}</p>
                          <p className="mt-1 text-[12px] font-medium text-[#8f7f73]">{accountDisplayName}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          className="flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#4f433c] transition hover:bg-[#faf6f2]"
                          onClick={() => {
                            setIsMobileProfileMenuOpen(false);
                            navigate("/settings");
                          }}
                          type="button"
                        >
                          <Settings size={15} />
                          <span>Settings</span>
                        </button>
                        <button
                          className="flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#c85e2f] transition hover:bg-[#fff4ee]"
                          onClick={handleLogout}
                          type="button"
                        >
                          <LogOut size={15} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                className="type-subpara min-h-[42px] w-full rounded-full border border-[#e4d9cf] bg-white px-[16px] pr-11 text-[#241913] outline-none shadow-[0_6px_18px_rgba(38,23,14,0.04)] transition duration-150 placeholder:text-[#a69486] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
                placeholder="Search order, menu item or customer"
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
              />
              {localSearch ? (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8f7f73] transition hover:bg-[#f6efe8] hover:text-[#241913]"
                  onClick={handleClearSearch}
                  type="button"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 max-[720px]:p-[14px] max-[960px]:pb-[92px]">
          <Outlet />
        </main>
      </div>

      <nav
        className="hidden max-[960px]:fixed max-[960px]:inset-x-0 max-[960px]:bottom-0 max-[960px]:z-20 max-[960px]:flex flex-row flex-nowrap overflow-x-auto hide-scrollbar gap-1.5 border-t border-[#e3d6ca] bg-white/95 px-3 py-2 shadow-[0_-10px_24px_rgba(38,23,14,0.08)]"
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label="Mobile navigation"
      >
        {sidebarItems.map(({ icon: Icon, label, to }) => ( // eslint-disable-line no-unused-vars
          <NavLink
            key={label}
            className={({ isActive }) =>
              [
                "flex flex-col items-center justify-center gap-1 rounded-[14px] px-3.5 py-2 text-[10px] font-semibold transition shrink-0 min-w-[70px] whitespace-nowrap",
                isActive
                  ? "bg-[#cf6e38] text-white shadow-[0_8px_16px_rgba(207,110,56,0.22)]"
                  : "text-[#6f645b] active:bg-[#f6ebe3]",
              ].join(" ")
            }
            to={to}
          >
            <div className="relative flex flex-col items-center">
              <Icon size={16} />
              {label === "Notifications" && unreadNotificationsCount > 0 && (
                <span className="absolute -right-2.5 -top-1.5 inline-flex min-w-[14px] h-[14px] items-center justify-center rounded-full bg-[#d86c3d] text-[8px] font-bold text-white px-0.5 leading-[14px] border border-white">
                  {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                </span>
              )}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
          </div>
    </div>
  );
}



