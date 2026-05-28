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
  const [items, setItems] = useState(menuManagementItems);

  function openFreshCreateMenu() {
    window.localStorage.removeItem(MENU_SELECTED_ITEM_STORAGE_KEY);
    window.localStorage.removeItem(MENU_DRAFT_STORAGE_KEY);
    navigate("/menu/create");
  }

  const filteredItems = useMemo(() => {
    const baseItems =
      activeTab === "All"
        ? items
        : activeTab === "Add-ons"
          ? []
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
  }, [activeTab, items, sortBy]);

  async function handleDelete(item) {
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

    setItems((current) => current.filter((entry) => entry.id !== item.id));
    await showVendorSuccessToast("Menu removed successfully.");
  }

  async function handleView(item) {
    window.localStorage.setItem(MENU_SELECTED_ITEM_STORAGE_KEY, JSON.stringify(item));
    navigate(`/menu/create?mode=view&id=${item.id}`);
  }

  function handleEdit(item) {
    window.localStorage.setItem(MENU_SELECTED_ITEM_STORAGE_KEY, JSON.stringify(item));
    navigate(`/menu/create?mode=edit&id=${item.id}`);
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
          />
        ))}

        <MenuCreateNewCard onClick={openFreshCreateMenu} />
      </div>
    </section>
  );
}
