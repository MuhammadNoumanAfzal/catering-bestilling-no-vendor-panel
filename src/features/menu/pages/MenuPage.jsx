import i18n from "../../../i18n";
import { Plus } from "lucide-react";
import { getMenuGroups } from "../utils/menuManagementGroups.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import VendorPageLoadingState from "../../../components/shared/VendorPageLoadingState";

import MenuManagementHeader from "../components/management/MenuManagementHeader";
import MenuManagementToolbar from "../components/management/MenuManagementToolbar";
import MenuOfferingCard from "../components/management/MenuOfferingCard";
import {
  deleteVendorAddOn,
  deleteVendorMenu,
  getVendorAddOns,
  getVendorMenus,
  updateVendorAddOnStatus,
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

function parseMenuPrice(value) {
  return Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
}

function getStatusUpdateMessage(item, nextStatus) {
  return i18n.t("menu.statusUpdated", { type: i18n.t(item.isAddOn ? "menu.addonLabel" : "menu.menuLabel"), status: i18n.t(`menu.${nextStatus}`) });
}

export default function MenuPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
          getVendorAddOns(),
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
            error.message || t("menu.unableLoad", { defaultValue: "Unable to load menu management right now." }),
            t("menu.dataUnavailable", { defaultValue: "Menu data unavailable" }),
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
  }, [t]);

  const filteredItems = useMemo(() => {
    const baseItems = getMenuGroups(activeTab, menuCards, addOnCards).flatMap((group) => group.items);

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
    navigate("/menu/add-ons/create?type=DEPENDENT");
  }

  function handleCreateSingleProduct() {
    navigate("/menu/add-ons/create?type=INDEPENDENT");
  }

  function handleView(item) {
    if (item.isAddOn) {
      return;
    }

    navigate(`/menu/create?mode=view&id=${encodeURIComponent(item.id)}`);
  }

  function handleEdit(item) {
    if (item.isAddOn) {
      navigate(`/menu/add-ons/create?mode=edit&id=${encodeURIComponent(item.id)}`);
      return;
    }

    navigate(`/menu/create?mode=edit&id=${encodeURIComponent(item.id)}`);
  }

  function handleDuplicate(item) {
    if (item.isAddOn) {
      navigate(`/menu/add-ons/create?mode=duplicate&id=${encodeURIComponent(item.id)}`);
      return;
    }

    navigate(`/menu/create?mode=duplicate&id=${encodeURIComponent(item.id)}`);
  }

  async function handleDelete(item) {
    if (item.isAddOn) {
      const result = await confirmVendorAction({
        title: t("menu.deleteAddOnTitle", { defaultValue: "Delete add-on?" }),
        text: t("menu.removeAddOn", { title: item.title, defaultValue: `Remove “${item.title}” from add-on management?` }),
        confirmButtonText: t("menu.delete", { defaultValue: "Delete" }),
        cancelButtonText: t("menu.keep", { defaultValue: "Keep it" }),
        icon: "warning",
        confirmButtonColor: "#ff2918",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        await deleteVendorAddOn(item.id);
        setAddOnCards((current) => current.filter((entry) => entry.id !== item.id));
        await showVendorSuccessToast(t("menu.removedAddOn", { defaultValue: "Add-on removed successfully." }));
      } catch (error) {
        await showVendorErrorAlert(error.message || t("menu.unableDeleteAddOn", { defaultValue: "Unable to delete the add-on." }));
      }
      return;
    }

    const result = await confirmVendorAction({
      title: t("menu.deleteMenuTitle", { defaultValue: "Delete menu?" }),
      text: t("menu.removeMenu", { title: item.title, defaultValue: `Remove “${item.title}” from menu management?` }),
      confirmButtonText: t("menu.delete", { defaultValue: "Delete" }),
      cancelButtonText: t("menu.keep", { defaultValue: "Keep it" }),
      icon: "warning",
      confirmButtonColor: "#ff2918",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteVendorMenu(item.id);
      setMenuCards((current) => current.filter((entry) => entry.id !== item.id));
      await showVendorSuccessToast(t("menu.removedMenu", { defaultValue: "Menu removed successfully." }));
    } catch (error) {
      await showVendorErrorAlert(error.message || t("menu.unableDeleteMenu", { defaultValue: "Unable to delete the menu." }));
    }
  }

  async function handleToggleStatus(item) {
    if (item.isAddOn) {
      const nextStatus = item.status === "Active" ? "paused" : "active";

      try {
        const result = await updateVendorAddOnStatus(item.id, nextStatus);
        setAddOnCards((current) =>
          current.map((addOn) =>
            addOn.id === item.id
              ? {
                  ...addOn,
                  status: nextStatus === "active" ? "Active" : "Paused",
                  tone: result.instance?.menuStatus || nextStatus,
                }
              : addOn,
          ),
        );
        await showVendorSuccessToast(
          getStatusUpdateMessage(item, nextStatus),
        );
      } catch (error) {
        await showVendorErrorAlert(error.message || t("menu.unableStatus", { defaultValue: "Unable to update the status." }));
      }
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
        getStatusUpdateMessage(item, nextStatus),
      );
    } catch (error) {
      await showVendorErrorAlert(error.message || t("menu.unableStatus", { defaultValue: "Unable to update the status." }));
    }
  }

  if (isLoading) {
    return <VendorPageLoadingState variant="detail" />;
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <MenuManagementHeader
        onCreateSingleProduct={handleCreateSingleProduct}
        onCreateAddOn={handleCreateAddOn}
        onCreateMenu={openFreshCreateMenu}
      />

      <MenuManagementToolbar
        activeTab={activeTab}
        onSortChange={setSortBy}
        onTabChange={setActiveTab}
        sortOptions={menuSortOptions.map((value) => ({ value, label: t(`menu.${{ Latest: "latest", Oldest: "oldest", "Highest Price": "highestPrice", "Lowest Price": "lowestPrice" }[value]}`, { defaultValue: value }) }))}
        tabs={menuManagementTabs.map((value) => ({ value, label: t(`menu.${{ All: "all", Active: "active", Draft: "draft", Paused: "paused", "Add-ons": "addOns", "Single Products": "singleProducts" }[value]}`, { defaultValue: value }) }))}
        valueSort={sortBy}
      />

      {getMenuGroups(activeTab, menuCards, addOnCards).map((group) => (
        <section key={group.type} className="mb-6 min-w-0">
          <h2 className="mb-3 text-lg font-semibold">
            {["Active", "Draft", "Paused"].includes(activeTab)
              ? t("menu.statusGroup", { status: t(`menu.${activeTab.toLowerCase()}`), type: t(`menu.${group.type}`) })
              : t(`menu.${group.type}`)}
          </h2>
          <div className="grid grid-cols-3 gap-4 max-[1120px]:grid-cols-2 max-[720px]:grid-cols-1">
          {filteredItems.filter((item) => group.items.includes(item)).map((item) => (
            <MenuOfferingCard
              key={`${group.type}-${item.id}`}
              item={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onView={handleView}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
            />
          ))}

          <button type="button"
            className="min-h-32 rounded-lg border border-dashed border-[#d6ccc4] bg-white p-5 text-sm font-semibold text-[#a34e26] hover:bg-[#faf7f4]"
            onClick={group.type === "singleProducts" ? handleCreateSingleProduct : group.type === "addOns" ? handleCreateAddOn : openFreshCreateMenu}>
            <Plus size={20} aria-hidden="true" className="mx-auto mb-2" />
            {t(group.type === "singleProducts" ? "menu.createSingleProduct" : group.type === "addOns" ? "menu.createAddOns" : "menu.createMenu")}
          </button>
        </div>
        </section>
      ))}
    </section>
  );
}
