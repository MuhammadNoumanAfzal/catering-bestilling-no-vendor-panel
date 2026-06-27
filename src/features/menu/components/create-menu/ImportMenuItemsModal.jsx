import { ChevronDown, ChevronRight, ChevronUp, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ImportMenuItemsModal({
  existingMenus = [],
  isOpen,
  onClose,
  onAdd,
  onRequestMenuItems,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedMenuIds, setExpandedMenuIds] = useState({});
  const [menuItemsByMenuId, setMenuItemsByMenuId] = useState({});
  const [loadingMenuIds, setLoadingMenuIds] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedItems([]);
      setExpandedMenuIds({});
    }
  }, [isOpen]);

  const filteredMenus = useMemo(() => {
    if (!searchTerm.trim()) {
      return existingMenus;
    }

    const lowerSearch = searchTerm.toLowerCase();

    return existingMenus.filter((menu) => {
      const titleMatch = (menu.title || "").toLowerCase().includes(lowerSearch);
      const descMatch = (menu.description || "").toLowerCase().includes(lowerSearch);
      const loadedItems = menuItemsByMenuId[menu.id] || [];
      const hasMatchingItems = loadedItems.some((item) =>
        (item.title || "").toLowerCase().includes(lowerSearch),
      );

      return titleMatch || descMatch || hasMatchingItems;
    });
  }, [existingMenus, menuItemsByMenuId, searchTerm]);

  if (!isOpen) {
    return null;
  }

  function handleToggleSelectItem(item, menu) {
    const key = `${menu.id}-${item.id}`;
    const isSelected = selectedItems.some((selectedItem) => selectedItem.key === key);

    if (isSelected) {
      setSelectedItems((current) => current.filter((selectedItem) => selectedItem.key !== key));
      return;
    }

    setSelectedItems((current) => [...current, { key, item }]);
  }

  function handleToggleSelectAll(menu) {
    const menuItems = menuItemsByMenuId[menu.id] || [];
    const allSelected =
      menuItems.length > 0 &&
      menuItems.every((item) =>
        selectedItems.some((selectedItem) => selectedItem.key === `${menu.id}-${item.id}`),
      );

    if (allSelected) {
      setSelectedItems((current) =>
        current.filter(
          (selectedItem) =>
            !menuItems.some((item) => selectedItem.key === `${menu.id}-${item.id}`),
        ),
      );
      return;
    }

    setSelectedItems((current) => {
      const nextSelection = [...current];

      menuItems.forEach((item) => {
        const key = `${menu.id}-${item.id}`;

        if (!nextSelection.some((selectedItem) => selectedItem.key === key)) {
          nextSelection.push({ key, item });
        }
      });

      return nextSelection;
    });
  }

  async function toggleExpandMenu(menuId) {
    setExpandedMenuIds((current) => ({
      ...current,
      [menuId]: !current[menuId],
    }));

    if (menuItemsByMenuId[menuId] || loadingMenuIds[menuId] || !onRequestMenuItems) {
      return;
    }

    try {
      setLoadingMenuIds((current) => ({
        ...current,
        [menuId]: true,
      }));
      const nextMenuItems = await onRequestMenuItems(menuId);
      setMenuItemsByMenuId((current) => ({
        ...current,
        [menuId]: nextMenuItems,
      }));
    } catch {
      setMenuItemsByMenuId((current) => ({
        ...current,
        [menuId]: [],
      }));
    } finally {
      setLoadingMenuIds((current) => ({
        ...current,
        [menuId]: false,
      }));
    }
  }

  function handleAddSelected() {
    onAdd(selectedItems.map((selectedItem) => selectedItem.item));
    setSelectedItems([]);
    setSearchTerm("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] animate-fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-[540px] flex-col rounded-[20px] border border-[#e4dbd2] bg-white p-5 shadow-[0_20px_50px_rgba(58,40,25,0.18)]">
        <div className="flex items-center justify-between border-b border-[#f2ece6] pb-3">
          <h2 className="m-0 text-[18px] font-extrabold text-[#211913]">Import from Previous Menu</h2>
          <button
            onClick={onClose}
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8dfd5] bg-[#fffdfa] text-[#746a62] transition hover:bg-[#faf8f6] hover:text-[#cf6e38] focus:outline-none active:scale-90"
          >
            <X size={14} />
          </button>
        </div>

        <div className="relative mt-4">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89d93]">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="h-[42px] w-full rounded-full border border-[#d7cec4] bg-[#fdfcfb] pl-10 pr-4 text-[14px] text-[#1f1814] outline-none transition placeholder:text-[#a89d93] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
            placeholder="Search menus or imported items..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="mt-4 flex-1 space-y-3.5 overflow-y-auto pr-1 scrollbar-thin">
          {filteredMenus.length ? (
            filteredMenus.map((menu) => {
              const menuItems = menuItemsByMenuId[menu.id] || [];
              const isExpanded = Boolean(expandedMenuIds[menu.id]);
              const isLoadingItems = Boolean(loadingMenuIds[menu.id]);
              const allSelected =
                menuItems.length > 0 &&
                menuItems.every((item) =>
                  selectedItems.some(
                    (selectedItem) => selectedItem.key === `${menu.id}-${item.id}`,
                  ),
                );

              return (
                <div
                  key={menu.id}
                  className="overflow-hidden rounded-xl border border-[#e8dfd5] bg-[#fffdfb] transition-all duration-200"
                >
                  <div
                    onClick={() => toggleExpandMenu(menu.id)}
                    className="flex cursor-pointer items-center justify-between p-3 transition hover:bg-[#fff9f4]"
                  >
                    <div className="flex min-w-0 flex-1 items-center">
                      <img
                        src={menu.image || "/heroBg.webp"}
                        alt={menu.title}
                        className="mr-3 h-[54px] w-[54px] rounded-lg bg-[#f2ece6] object-cover"
                      />
                      <div className="min-w-0 pr-2">
                        <h3 className="m-0 truncate text-[15px] font-extrabold text-[#211913]">
                          {menu.title}
                        </h3>
                        <p className="m-0 mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[#746a62]">
                          {menu.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleSelectAll(menu);
                        }}
                        disabled={!menuItems.length}
                        className={`cursor-pointer rounded border px-2 py-1 text-[12px] font-bold transition ${
                          allSelected
                            ? "border-[#c7ebd0] bg-[#edf9ef] text-[#237a39]"
                            : "border-[#d6cdc4] bg-white text-[#746a62] hover:bg-[#fcfaf7]"
                        } ${!menuItems.length ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {allSelected ? "All Selected" : "Select All"}
                      </button>
                      <span className="text-[#8c7f73]">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="space-y-0.5 border-t border-[#f2ece6] bg-white px-3 py-1">
                      {isLoadingItems ? (
                        <div className="flex items-center justify-center gap-2 py-5 text-[12px] font-semibold text-[#8a7d72]">
                          <LoaderCircle size={14} className="animate-spin" />
                          Loading menu items...
                        </div>
                      ) : menuItems.length ? (
                        menuItems.map((item) => {
                          const itemKey = `${menu.id}-${item.id}`;
                          const isItemSelected = selectedItems.some(
                            (selectedItem) => selectedItem.key === itemKey,
                          );

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleSelectItem(item, menu)}
                              className="flex cursor-pointer items-center justify-between rounded px-1.5 py-2.5 transition hover:bg-[#fffdfa]"
                            >
                              <div className="flex flex-1 items-center">
                                <input
                                  type="checkbox"
                                  checked={isItemSelected}
                                  onChange={() => {}}
                                  className="h-4.5 w-4.5 cursor-pointer rounded border-[#d6cdc4] accent-[#cf6e38]"
                                />
                                <img
                                  src={item.image || "/heroBg.webp"}
                                  alt={item.title}
                                  className="ml-3 mr-3.5 h-10 w-10 rounded-md bg-[#f2ece6] object-cover"
                                />
                                <span className="text-[14px] font-extrabold text-[#211913]">
                                  {item.title}
                                </span>
                              </div>
                              <div className="pr-1 text-[#c1b5a9]">
                                <ChevronRight size={14} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="py-4 text-center text-[12px] text-[#8a7d72]">
                          No items available in this menu.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="m-0 text-[13px] font-bold text-[#746a62]">No matching menus found</p>
              <p className="m-0 mt-1 text-[11px] text-[#aea39a]">
                Try a different search term.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2.5 border-t border-[#f2ece6] pt-3">
          <button
            onClick={onClose}
            type="button"
            className="h-[38px] cursor-pointer rounded-lg border border-[#d6cdc4] bg-white px-4 text-[13px] font-extrabold text-[#3a2e25] transition hover:bg-[#faf8f6] active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedItems.length === 0}
            type="button"
            className="h-[38px] cursor-pointer rounded-lg bg-[#cf6e38] px-5 text-[13px] font-extrabold text-white transition hover:bg-[#bf622f] active:scale-95 disabled:pointer-events-none disabled:opacity-45"
          >
            Add Selected ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}
