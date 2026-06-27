import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MenuCreateNewCard from "../components/management/MenuCreateNewCard";
import MenuManagementHeader from "../components/management/MenuManagementHeader";
import MenuManagementToolbar from "../components/management/MenuManagementToolbar";
import MenuOfferingCard from "../components/management/MenuOfferingCard";
import {
  deleteVendorMenu,
  getVendorMenuFormBootstrap,
  getVendorMenus,
  updateVendorMenuStatus,
} from "../api/menuApi";
import {
  mapMenuListResponse,
  mapVendorAddOnNodeToCard,
} from "../api/menuMappers";
import {
  menuManagementTabs,
  menuSortOptions,
} from "../menuConstants";
import {
  confirmVendorAction,
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

function normalizeStatus(value) {
  return String(value || "").toLowerCase();
}

function parseMenuPrice(value) {
  return Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
}

export default function MenuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [menuCards, setMenuCards] = useState([]);
  const [addOnCards, setAddOnCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadMenuManagementData() {
      setIsLoading(true);

      try {
        const [menusResult, bootstrapResult] = await Promise.all([
          getVendorMenus(),
          getVendorMenuFormBootstrap(),
        ]);

        if (isCancelled) {
          return;
        }

        setMenuCards(mapMenuListResponse(menusResult));
        setAddOnCards(
          (bootstrapResult.vendorAddOns?.edges || [])
            .map((edge) => edge?.node)
            .filter(Boolean)
            .map(mapVendorAddOnNodeToCard),
        );
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load menu management right now.",
            "Menu data unavailable",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMenuManagementData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const baseItems =
      activeTab === "All"
        ? menuCards
        : activeTab === "Add-ons"
          ? addOnCards
          : menuCards.filter((item) => normalizeStatus(item.status) === normalizeStatus(activeTab));

    const searchQuery = searchParams.get("search")?.toLowerCase().trim() || "";
    const searchedItems = searchQuery
      ? baseItems.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery) ||
            (item.description && item.description.toLowerCase().includes(searchQuery)) ||
            (item.badge && item.badge.toLowerCase().includes(searchQuery)),
        )
      : baseItems;

    const nextItems = [...searchedItems];

    if (sortBy === "Oldest") {
      nextItems.sort((firstItem, secondItem) =>
        String(firstItem.createdOn || firstItem.updatedOn || "").localeCompare(
          String(secondItem.createdOn || secondItem.updatedOn || ""),
        ),
      );
    }

    if (sortBy === "Latest") {
      nextItems.sort((firstItem, secondItem) =>
        String(secondItem.updatedOn || secondItem.createdOn || "").localeCompare(
          String(firstItem.updatedOn || firstItem.createdOn || ""),
        ),
      );
    }

    if (sortBy === "Highest Price") {
      nextItems.sort((firstItem, secondItem) => parseMenuPrice(secondItem.price) - parseMenuPrice(firstItem.price));
    }

    if (sortBy === "Lowest Price") {
      nextItems.sort((firstItem, secondItem) => parseMenuPrice(firstItem.price) - parseMenuPrice(secondItem.price));
    }

    return nextItems;
  }, [activeTab, addOnCards, menuCards, searchParams, sortBy]);

  function openFreshCreateMenu() {
    navigate("/menu/create");
  }

  function handleCreateAddOn() {
    navigate("/menu/add-ons/create");
  }

  function handleView(item) {
    if (item.isAddOn) {
      return;
    }

    navigate(`/menu/create?mode=view&id=${encodeURIComponent(item.id)}`);
  }

  function handleEdit(item) {
    if (item.isAddOn) {
      return;
    }

    navigate(`/menu/create?mode=edit&id=${encodeURIComponent(item.id)}`);
  }

  function handleDuplicate(item) {
    if (item.isAddOn) {
      return;
    }

    navigate(`/menu/create?mode=duplicate&id=${encodeURIComponent(item.id)}`);
  }

  async function handleDelete(item) {
    if (item.isAddOn) {
      await showVendorErrorAlert(
        "Add-on management APIs are not connected yet in this module.",
        "Add-on actions unavailable",
      );
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

    try {
      await deleteVendorMenu(item.id);
      setMenuCards((current) => current.filter((entry) => entry.id !== item.id));
      await showVendorSuccessToast("Menu removed successfully.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to delete the menu.");
    }
  }

  async function handleToggleStatus(item) {
    if (item.isAddOn) {
      await showVendorErrorAlert(
        "Add-on status APIs are not connected yet in this module.",
        "Add-on actions unavailable",
      );
      return;
    }

    const nextStatus = item.status === "Active" ? "paused" : "active";

    try {
      const result = await updateVendorMenuStatus(item.id, nextStatus);
      setMenuCards((current) =>
        current.map((menu) =>
          menu.id === item.id
            ? {
                ...menu,
                status: nextStatus === "active" ? "Active" : "Paused",
                tone: result.instance?.menuStatus || nextStatus,
              }
            : menu,
        ),
      );
      await showVendorSuccessToast(
        `Menu status set to ${nextStatus === "active" ? "Active" : "Paused"}.`,
      );
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to update the menu status.");
    }
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

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4 max-[1120px]:grid-cols-2 max-[720px]:grid-cols-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`menu-skeleton-${index}`}
              className="min-h-[312px] animate-pulse rounded-[14px] border border-[#ddd4cb] bg-[#f3ece5]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-[1120px]:grid-cols-2 max-[720px]:grid-cols-1">
          {filteredItems.map((item) => (
            <MenuOfferingCard
              key={item.id}
              actionsDisabled={Boolean(item.isAddOn)}
              item={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onView={handleView}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
            />
          ))}

          <MenuCreateNewCard
            onClick={activeTab === "Add-ons" ? handleCreateAddOn : openFreshCreateMenu}
          />
        </div>
      )}
    </section>
  );
}
