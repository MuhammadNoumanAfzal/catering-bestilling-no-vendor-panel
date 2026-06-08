import {
  Bell,
  BadgeDollarSign,
  ChevronDown,
  House,
  LifeBuoy,
  LogOut,
  MessageSquareText,
  ShoppingBasket,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import AppFooter from "../components/AppFooter";
import { useAuth } from "../../features/auth/context/AuthContext";
import { confirmVendorLogout } from "../../utils/vendorAlerts";

const sidebarItems = [
  { label: "Home", to: "/dashboard", icon: House },
  { label: "Orders", to: "/orders", icon: ShoppingBasket },
  { label: "Finance", to: "/finance", icon: BadgeDollarSign },
  { label: "Reviews", to: "/reviews", icon: MessageSquareText },
  { label: "Support", to: "/support", icon: LifeBuoy },
];

export default function AppLayout() {
  const { logout, user } = useAuth();

  async function handleLogout() {
    const result = await confirmVendorLogout();

    if (result.isConfirmed) {
      logout();
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f4f0ea] text-[#201914] max-[960px]:flex-col">
      <aside className="flex w-[252px] shrink-0 flex-col justify-between bg-[#cd6434] p-[10px] text-[#fff8f3] max-[960px]:w-full">
        <div className="flex flex-col gap-3">
          <div className="rounded-[14px] bg-white/15 px-3 py-2.5">
            <img className="block h-auto w-28" src="/logo2.webp" alt="Catering bestilling.no" />
          </div>

          <nav
            className="mt-1 flex flex-col gap-1.5 max-[960px]:flex-row max-[960px]:flex-wrap"
            aria-label="Primary navigation"
          >
            {sidebarItems.map(({ icon: Icon, label, to }) => (
              <NavLink
                key={label}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2.5 rounded-[10px] px-3 py-[11px] transition-colors duration-150",
                    isActive
                      ? "bg-white text-[#bb582d] shadow-[0_8px_16px_rgba(126,54,17,0.14)]"
                      : "text-inherit hover:bg-white/15",
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
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] bg-transparent px-3 py-[11px] transition-colors duration-150 hover:bg-white/15"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={16} />
          <span className="type-subpara">Logout</span>
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[#e4d9cf] bg-[#fffdf9] px-5 py-3 max-[960px]:flex-col max-[960px]:items-stretch">
          <div className="max-w-[480px] flex-1">
            <input
              className="type-subpara min-h-[38px] w-full rounded-full border border-[#e4d9cf] bg-white px-[14px] text-[#241913] outline-none transition duration-150 placeholder:text-[#a69486] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
              placeholder="Search order, menu item or customer"
              type="text"
            />
          </div>

          <div className="flex items-center gap-2.5 max-[960px]:flex-wrap max-[960px]:justify-between">
            <span className="type-subpara rounded-full bg-[#d7f5d8] px-3 py-[7px] uppercase text-[#237a39]">
              Restaurant Active
            </span>

            <button
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[#e4d9cf] bg-white px-2 pb-[5px] pl-[6px] pr-2 pt-[5px] text-[#241913]"
              type="button"
            >
              <img
                className="h-7 w-7 rounded-full object-cover"
                src="/heroBg.webp"
                alt="Raj Holder"
              />
              <span className="flex flex-col items-start leading-[1.15]">
                <strong className="type-subpara">{user?.name || "Raj Holder"}</strong>
                <span className="type-subpara text-[#8f7f73]">{user?.role || "Admin"}</span>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 max-[720px]:p-[14px]">
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
