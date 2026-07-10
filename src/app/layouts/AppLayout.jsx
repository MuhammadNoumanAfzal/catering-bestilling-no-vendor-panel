import {
  BadgeDollarSign,
  Bell,
  ChevronDown,
  CircleUserRound,
  House,
  LifeBuoy,
  LogOut,
  MessageSquareText,
  Settings,
  ShoppingBasket,
  Truck,
  Utensils,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AppFooter from "../components/AppFooter";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { confirmVendorLogout, showNewNotificationToast } from "../../utils/vendorAlerts";
import {
  getVendorNotificationCounts,
  getVendorNotifications,
} from "../../features/notifications/api/notificationsApi";
import { getVendorSettingsPage } from "../../features/settings/api/settingsApi";

const sidebarItems = [
  { label: "Dashboard", to: "/dashboard", icon: House },
  { label: "Orders", to: "/orders", icon: ShoppingBasket },
  { label: "Menu", to: "/menu", icon: Utensils },
  { label: "Delivery", to: "/delivery", icon: Truck },
  { label: "Finance", to: "/finance", icon: BadgeDollarSign },
  { label: "Reviews", to: "/reviews", icon: MessageSquareText },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Support", to: "/support", icon: LifeBuoy },
  { label: "Settings", to: "/settings", icon: Settings },
];

const NOTIFICATION_POLL_INTERVAL_MS = 30000;

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
  const { pathname } = useLocation();
  const searchParamValue = searchParams.get("search") || "";
  const isSearchablePage = pathname === "/orders" || pathname === "/menu";
  const localSearch = isSearchablePage ? searchParamValue : headerSearch;
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Vendor User";
  const displayRole = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : "Vendor";
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const prevUnreadCountRef = useRef(null);
  const [isDesktopProfileMenuOpen, setIsDesktopProfileMenuOpen] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  const desktopProfileMenuRef = useRef(null);
  const mobileProfileMenuRef = useRef(null);
  const profileInitials = getInitials(displayName);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfileImage() {
      try {
        const result = await getVendorSettingsPage();
        const settings = result?.vendorSettings;
        const nextProfileImageUrl =
          settings?.account?.avatar?.fileUrl ||
          settings?.businessProfile?.profileImage?.fileUrl ||
          settings?.logoUrl ||
          "";

        if (!isCancelled) {
          setProfileImageUrl(nextProfileImageUrl);
        }
      } catch {
        if (!isCancelled) {
          setProfileImageUrl("");
        }
      }
    }

    loadProfileImage();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadNotificationCounts() {
      try {
        const result = await getVendorNotificationCounts();
        const unreadCount = result?.vendorNotificationCounts?.unread || 0;

        if (!isCancelled) {
          setUnreadNotificationsCount(unreadCount);

          if (prevUnreadCountRef.current !== null && unreadCount > prevUnreadCountRef.current) {
            getVendorNotifications({ status: "UNREAD", first: 1 })
              .then((notificationsRes) => {
                if (isCancelled) return;
                const latest = notificationsRes?.vendorNotifications?.edges?.[0]?.node;
                const title = latest?.title || "New Notification";
                const message = latest?.message || "You have received a new update.";
                showNewNotificationToast(title, message);
              })
              .catch(() => {
                showNewNotificationToast("New Notification", "You have received a new update.");
              });
          }
          prevUnreadCountRef.current = unreadCount;
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

  async function handleLogout() {
    const result = await confirmVendorLogout();

    if (result.isConfirmed) {
      setIsDesktopProfileMenuOpen(false);
      setIsMobileProfileMenuOpen(false);
      logout();
    }
  }

  function handleOpenSettings() {
    setIsDesktopProfileMenuOpen(false);
    setIsMobileProfileMenuOpen(false);
    navigate("/settings");
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
    <div className="flex min-h-screen bg-[#f4f0ea] text-[#201914] max-[960px]:flex-col">
      <aside className="relative flex w-[252px] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(180deg,#d86c3d_0%,#cb6134_52%,#b95028_100%)] p-4 text-[#fff8f3] shadow-[8px_0_24px_rgba(121,61,23,0.16)] max-[960px]:hidden">
        <div className="absolute -right-14 top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute bottom-16 -left-10 h-24 w-24 rounded-full bg-[#ffd9c6]/10 blur-2xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-4">
          <div className="rounded-[22px] border border-white/10 bg-white/12 px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <img className="block h-auto w-32" src="/logo2.webp" alt="Catering bestilling.no" />
            <p className="type-subpara mt-3 text-white/75">Vendor dashboard</p>
          </div>

          <nav
            className="mt-1 flex flex-col gap-2 max-[960px]:flex-row max-[960px]:flex-wrap"
            aria-label="Primary navigation"
          >
            {sidebarItems.map(({ icon: Icon, label, to }) => ( // eslint-disable-line no-unused-vars
              <NavLink
                key={label}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2.5 rounded-[16px] px-4 py-3 text-[13px] font-semibold transition-all duration-150",
                    isActive
                      ? "bg-white text-[#c85e2f] shadow-[0_10px_22px_rgba(90,35,12,0.16)]"
                      : "text-white/92 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
                to={to}
              >
                <Icon size={16} />
                <span className="type-subpara">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          className="relative z-[1] flex w-full cursor-pointer items-center gap-2.5 rounded-[16px] border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/15"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={16} />
          <span className="type-subpara">Logout</span>
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-40 flex items-center justify-between gap-4 border-b border-[#e4d9cf] bg-[#fffdf9]/95 px-5 py-3 backdrop-blur-sm max-[960px]:flex-col max-[960px]:items-stretch max-[960px]:border-b-0 max-[960px]:bg-transparent max-[960px]:px-3 max-[960px]:pt-3">
          <div className="max-w-[480px] flex-1 max-[960px]:hidden">
            <input
              className="type-subpara min-h-[42px] w-full rounded-full border border-[#e4d9cf] bg-white px-[16px] text-[#241913] outline-none shadow-[0_6px_18px_rgba(38,23,14,0.04)] transition duration-150 placeholder:text-[#a69486] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
              placeholder="Search order, menu item or customer"
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-2.5 max-[960px]:hidden">
            <button
              onClick={handleOpenNotifications}
              className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e4d9cf] bg-white text-[#241913] hover:bg-[#fcfaf5] transition shadow-[0_4px_12px_rgba(38,23,14,0.04)]"
              type="button"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 ? (
                <>
                  <span className="absolute right-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-[#cf6e38]" />
                  <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#cf6e38] px-1 text-[10px] font-bold leading-[18px] text-white">
                    {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                  </span>
                </>
              ) : null}
            </button>

            <div className="relative" ref={desktopProfileMenuRef}>
              <button
                onClick={() => setIsDesktopProfileMenuOpen((current) => !current)}
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[#e4d9cf] bg-white px-2 pb-[5px] pl-[6px] pr-2 pt-[5px] text-[#241913] shadow-[0_6px_18px_rgba(38,23,14,0.06)]"
                type="button"
              >
                {renderProfileAvatar()}
                <span className="flex flex-col items-start leading-[1.15]">
                  <strong className="type-subpara">{displayName}</strong>
                  <span className="type-subpara text-[#8f7f73]">{displayRole}</span>
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
                      <p className="mt-1 text-[12px] font-medium text-[#8f7f73]">{displayRole}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col gap-1">
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#2b221d] transition hover:bg-[#faf6f2]"
                      onClick={handleOpenSettings}
                      type="button"
                    >
                      <CircleUserRound size={15} />
                      <span>Account settings</span>
                    </button>
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#2b221d] transition hover:bg-[#faf6f2]"
                      onClick={handleOpenNotifications}
                      type="button"
                    >
                      <Bell size={15} />
                      <span>Notifications</span>
                    </button>
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#c85e2f] transition hover:bg-[#fff4ee]"
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
                <img className="block h-auto w-32" src="/logo2.webp" alt="Catering bestilling.no" />
                <div className="flex items-center gap-2">
                  <button
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
                    onClick={() => navigate("/notifications")}
                    type="button"
                  >
                    <Bell size={16} />
                    {unreadNotificationsCount > 0 ? (
                      <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold leading-[18px] text-[#cf6e38]">
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
                      <strong className="type-subpara">{displayName}</strong>
                      <span className="type-subpara text-[#8f7f73]">{displayRole}</span>
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
                          <p className="mt-1 text-[12px] font-medium text-[#8f7f73]">{displayRole}</p>
                        </div>
                      </div>
                      <button
                        className="flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold transition hover:bg-[#faf6f2]"
                        onClick={handleOpenSettings}
                        type="button"
                      >
                        <CircleUserRound size={15} />
                        <span>Account settings</span>
                      </button>
                      <button
                        className="flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold transition hover:bg-[#faf6f2]"
                        onClick={handleOpenNotifications}
                        type="button"
                      >
                        <Bell size={15} />
                        <span>Notifications</span>
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
                  ) : null}
                </div>
              </div>
            </div>

            <input
              className="type-subpara min-h-[42px] w-full rounded-full border border-[#e4d9cf] bg-white px-[16px] text-[#241913] outline-none shadow-[0_6px_18px_rgba(38,23,14,0.04)] transition duration-150 placeholder:text-[#a69486] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
              placeholder="Search order, menu item or customer"
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>
        </header>

        <main className="flex-1 p-5 max-[720px]:p-[14px] max-[960px]:pb-[92px]">
          <Outlet />
        </main>

        <AppFooter />
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
  );
}
