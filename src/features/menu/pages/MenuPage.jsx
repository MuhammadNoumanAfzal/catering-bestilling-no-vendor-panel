import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MenuCreateNewCard from "../components/management/MenuCreateNewCard";
import MenuManagementHeader from "../components/management/MenuManagementHeader";
import MenuManagementToolbar from "../components/management/MenuManagementToolbar";
import MenuOfferingCard from "../components/management/MenuOfferingCard";
import {
  menuManagementItems,
  menuManagementTabs,
  menuSortOptions,
  optionalAddOns,
} from "../data/menuData";
import {
  confirmVendorAction,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const MENU_SELECTED_ITEM_STORAGE_KEY = "vendor-menu-selected-item";
const MENU_DRAFT_STORAGE_KEY = "vendor-menu-builder-state";

function normalizeStatus(value) {
  return value.toLowerCase();
}

export default function MenuPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  
  const [items, setItems] = useState(() => {
    const savedMenusRaw = window.localStorage.getItem("vendor-menu-items");
    if (savedMenusRaw) {
      return JSON.parse(savedMenusRaw);
    } else {
      window.localStorage.setItem("vendor-menu-items", JSON.stringify(menuManagementItems));
      return menuManagementItems;
    }
  });

  const [addOns, setAddOns] = useState(() => {
    const savedAddOnsRaw = window.localStorage.getItem("vendor-addon-items");
    if (savedAddOnsRaw) {
      return JSON.parse(savedAddOnsRaw);
    } else {
      window.localStorage.setItem("vendor-addon-items", JSON.stringify(optionalAddOns));
      return optionalAddOns;
    }
  });

  function openFreshCreateMenu() {
    window.localStorage.removeItem(MENU_SELECTED_ITEM_STORAGE_KEY);
    window.localStorage.removeItem(MENU_DRAFT_STORAGE_KEY);
    navigate("/menu/create");
  }

  const addOnsList = useMemo(() => {
    return addOns.map((addon) => ({
      id: addon.id,
      title: addon.addOnName || addon.name,
      description: addon.category || "Optional Add-on",
      price: addon.price.toString().startsWith("$") ? addon.price : `$${addon.price}`,
      meta: addon.availableImmediately ?? true ? "Available immediately" : "Scheduled",
      image: addon.image || "/heroBg.webp",
      status: addon.availableImmediately ?? true ? "Active" : "Paused",
      badge: addon.category || "Add-on",
      tone: addon.availableImmediately ?? true ? "active" : "paused",
      isAddOn: true,
      rawAddon: addon,
    }));
  }, [addOns]);

  const filteredItems = useMemo(() => {
    const baseItems =
      activeTab === "All"
        ? items
        : activeTab === "Add-ons"
          ? addOnsList
          : items.filter((item) => normalizeStatus(item.status) === normalizeStatus(activeTab));

    const nextItems = [...baseItems];

    if (sortBy === "Oldest") {
      nextItems.reverse();
    }

    if (sortBy === "Highest Price") {
      nextItems.sort(
        (first, second) =>
          Number(second.price.replace(/[^0-9.]/g, "")) -
          Number(first.price.replace(/[^0-9.]/g, "")),
      );
    }

    if (sortBy === "Lowest Price") {
      nextItems.sort(
        (first, second) =>
          Number(first.price.replace(/[^0-9.]/g, "")) -
          Number(second.price.replace(/[^0-9.]/g, "")),
      );
    }

    return nextItems;
  }, [activeTab, items, sortBy, addOnsList]);

  async function handleDelete(item) {
    if (item.isAddOn) {
      const result = await confirmVendorAction({
        title: "Delete add-on?",
        text: `Remove "${item.title}" from add-ons?`,
        confirmButtonText: "Delete",
        cancelButtonText: "Keep it",
        icon: "warning",
        confirmButtonColor: "#ff2918",
      });

      if (!result.isConfirmed) {
        return;
      }

      const savedAddOnsRaw = window.localStorage.getItem("vendor-addon-items");
      const savedAddOns = savedAddOnsRaw ? JSON.parse(savedAddOnsRaw) : [];
      const updatedAddOns = savedAddOns.filter((entry) => entry.id !== item.id);
      window.localStorage.setItem("vendor-addon-items", JSON.stringify(updatedAddOns));
      setAddOns(updatedAddOns);
      await showVendorSuccessToast("Add-on removed successfully.");
      return;
    }

    const result = await confirmVendorAction({
      title: "Delete menu?",
      text: `Remove "${item.title}" from menu management?`,
      confirmButtonText: "Delete",
      cancelButtonText: "Keep it",
      icon: "warning",
      confirmButtonColor: "#ff2918",
    });

    if (!result.isConfirmed) {
      return;
    }

    setItems((current) => {
      const nextList = current.filter((entry) => entry.id !== item.id);
      window.localStorage.setItem("vendor-menu-items", JSON.stringify(nextList));
      return nextList;
    });
    await showVendorSuccessToast("Menu removed successfully.");
  }

  async function handleView(item) {
    window.localStorage.setItem(MENU_SELECTED_ITEM_STORAGE_KEY, JSON.stringify(item));
    navigate(`/menu/create?mode=view&id=${item.id}`);
  }

  function handleEdit(item) {
    if (item.isAddOn) {
      navigate(`/menu/add-ons/create?mode=edit&id=${item.id}`);
      return;
    }
    window.localStorage.setItem(MENU_SELECTED_ITEM_STORAGE_KEY, JSON.stringify(item));
    navigate(`/menu/create?mode=edit&id=${item.id}`);
  }

  async function handleToggleStatus(item) {
    if (item.isAddOn) {
      const updatedAddOns = addOns.map((addon) => {
        if (addon.id === item.id) {
          const currentAvailable = addon.availableImmediately ?? true;
          return {
            ...addon,
            availableImmediately: !currentAvailable,
          };
        }
        return addon;
      });
      window.localStorage.setItem("vendor-addon-items", JSON.stringify(updatedAddOns));
      setAddOns(updatedAddOns);
      await showVendorSuccessToast(
        `Add-on status set to ${
          !(item.rawAddon.availableImmediately ?? true) ? "Active" : "Paused"
        }.`
      );
      return;
    }

    const updatedMenus = items.map((menu) => {
      if (menu.id === item.id) {
        const isCurrentlyActive = menu.status === "Active";
        const nextStatus = isCurrentlyActive ? "Paused" : "Active";
        return {
          ...menu,
          status: nextStatus,
          tone: nextStatus.toLowerCase(),
        };
      }
      return menu;
    });
    window.localStorage.setItem("vendor-menu-items", JSON.stringify(updatedMenus));
    setItems(updatedMenus);
    await showVendorSuccessToast(
      `Menu status set to ${item.status === "Active" ? "Paused" : "Active"}.`
    );
  }

  async function handleDuplicate(item) {
    if (item.isAddOn) {
      const sourceAddon = item.rawAddon;
      const newAddon = {
        ...sourceAddon,
        id: `addon-${Date.now()}`,
        addOnName: `${sourceAddon.addOnName || sourceAddon.name} - Copy`,
        availableImmediately: sourceAddon.availableImmediately ?? true,
      };

      const updatedAddOns = [newAddon, ...addOns];
      window.localStorage.setItem("vendor-addon-items", JSON.stringify(updatedAddOns));
      setAddOns(updatedAddOns);
      await showVendorSuccessToast(`Add-on "${newAddon.addOnName}" duplicated successfully.`);
      return;
    }

    const newMenu = {
      ...item,
      id: `menu-${Date.now()}`,
      title: `${item.title} - Copy`,
      menuTitle: item.menuTitle ? `${item.menuTitle} - Copy` : `${item.title} - Copy`,
      status: item.status || "Active",
      tone: item.tone || "active",
    };
    delete newMenu.isAddOn;
    delete newMenu.rawAddon;

    const updatedMenus = [newMenu, ...items];
    window.localStorage.setItem("vendor-menu-items", JSON.stringify(updatedMenus));
    setItems(updatedMenus);
    await showVendorSuccessToast(`Menu "${newMenu.title}" duplicated successfully.`);
  }

  function handleCreateAddOn() {
    navigate("/menu/add-ons/create");
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <MenuManagementHeader
        onCreateAddOn={handleCreateAddOn}
        onCreateMenu={openFreshCreateMenu}
      />

      <MenuManagementToolbar
        activeTab={activeTab}
        onSortChange={setSortBy}
        onTabChange={setActiveTab}
        sortOptions={menuSortOptions}
        tabs={menuManagementTabs}
        valueSort={sortBy}
      />

      <div className="grid grid-cols-3 gap-4 max-[1120px]:grid-cols-2 max-[720px]:grid-cols-1">
        {filteredItems.map((item) => (
          <MenuOfferingCard
            key={item.id}
            item={item}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onView={handleView}
            onDuplicate={handleDuplicate}
            onToggleStatus={handleToggleStatus}
          />
        ))}

        <MenuCreateNewCard onClick={activeTab === "Add-ons" ? handleCreateAddOn : openFreshCreateMenu} />
      </div>
    </section>
  );
}
