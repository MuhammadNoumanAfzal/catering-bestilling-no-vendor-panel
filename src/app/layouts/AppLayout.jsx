import {
  Bell,
  ChevronDown,
  CreditCard,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const sidebarItems = [
  { label: "Home", to: "/dashboard", icon: LayoutGrid },
  { label: "Orders", to: "/orders", icon: ShoppingCart },
  { label: "Menu", to: "/menu", icon: Package },
  { label: "Delivery", to: "/delivery", icon: Truck },
  { label: "Finance", to: "/finance", icon: CreditCard },
  { label: "Reviews", to: "/reviews", icon: Star },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-top">
          <div className="app-brand">
            <img className="app-brand-logo" src="/logo.png" alt="Catering bestilling.no" />
          </div>

          <button className="app-sidebar-store" type="button">
            <span className="type-subpara">View Store</span>
            <ChevronDown size={14} />
          </button>

          <nav className="app-sidebar-nav" aria-label="Primary navigation">
            {sidebarItems.map(({ icon: Icon, label, to }) => (
              <NavLink
                key={label}
                className={({ isActive }) =>
                  `app-sidebar-link ${isActive ? "is-active" : ""}`
                }
                to={to}
              >
                <Icon size={16} />
                <span className="type-subpara">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button className="app-sidebar-logout" type="button">
          <LogOut size={16} />
          <span className="type-subpara">Logout</span>
        </button>
      </aside>

      <div className="app-main-area">
        <header className="app-topbar">
          <div className="app-search">
            <input
              className="app-search-input type-subpara"
              placeholder="Search order, menu item or customer"
              type="text"
            />
          </div>

          <div className="app-topbar-right">
            <span className="app-status-pill type-subpara">Restaurant Active</span>

            <button className="app-icon-button" type="button" aria-label="Notifications">
              <Bell size={16} />
            </button>

            <button className="app-user-chip" type="button">
              <img className="app-user-avatar" src="/heroBg.webp" alt="Raj Holder" />
              <span className="app-user-meta">
                <strong className="type-subpara">Raj Holder</strong>
                <span className="type-subpara">Admin</span>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
