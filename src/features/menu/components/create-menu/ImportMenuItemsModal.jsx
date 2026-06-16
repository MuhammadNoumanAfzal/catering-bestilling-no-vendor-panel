import { ChevronDown, ChevronRight, ChevronUp, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { menuManagementItems } from "../../data/menuData";

export default function ImportMenuItemsModal({ isOpen, onClose, onAdd }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedMenuIds, setExpandedMenuIds] = useState({});

  const [existingMenus, setExistingMenus] = useState(() => {
    const savedMenusRaw = window.localStorage.getItem("vendor-menu-items");
    return savedMenusRaw ? JSON.parse(savedMenusRaw) : menuManagementItems;
  });

  // Expand all matching menus on search term changes to expose matching items
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      const nextExpanded = {};
      existingMenus.forEach((menu) => {
        const titleMatch = (menu.title || "").toLowerCase().includes(lowerSearch);
        const descMatch = (menu.description || "").toLowerCase().includes(lowerSearch);
        const hasMatchingItems = (menu.menuItems || []).some((item) =>
          (item.title || "").toLowerCase().includes(lowerSearch)
        );
        if (titleMatch || descMatch || hasMatchingItems) {
          nextExpanded[menu.id] = true;
        }
      });
      setExpandedMenuIds(nextExpanded);
    }
  }, [searchTerm, existingMenus]);

  const filteredMenus = useMemo(() => {
    if (!searchTerm.trim()) return existingMenus;
    const lowerSearch = searchTerm.toLowerCase();
    return existingMenus.filter((menu) => {
      const titleMatch = (menu.title || "").toLowerCase().includes(lowerSearch);
      const descMatch = (menu.description || "").toLowerCase().includes(lowerSearch);
      const hasMatchingItems = (menu.menuItems || []).some((item) =>
        (item.title || "").toLowerCase().includes(lowerSearch)
      );
      return titleMatch || descMatch || hasMatchingItems;
    });
  }, [existingMenus, searchTerm]);

  if (!isOpen) return null;

  const handleToggleSelectItem = (item, menu) => {
    const key = `${menu.id}-${item.id}`;
    const isSelected = selectedItems.some((si) => si.key === key);
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((si) => si.key !== key));
    } else {
      setSelectedItems((prev) => [...prev, { key, item }]);
    }
  };

  const handleToggleSelectAll = (menu) => {
    const menuItems = menu.menuItems || [];
    const allSelected = menuItems.length > 0 && menuItems.every((item) =>
      selectedItems.some((si) => si.key === `${menu.id}-${item.id}`)
    );

    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter((si) => !menuItems.some((item) => si.key === `${menu.id}-${item.id}`))
      );
    } else {
      setSelectedItems((prev) => {
        const next = [...prev];
        menuItems.forEach((item) => {
          const key = `${menu.id}-${item.id}`;
          if (!next.some((si) => si.key === key)) {
            next.push({ key, item });
          }
        });
        return next;
      });
    }
  };

  const toggleExpandMenu = (menuId) => {
    setExpandedMenuIds((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleAddSelected = () => {
    onAdd(selectedItems.map((si) => si.item));
    setSelectedItems([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] animate-fade-in">
      <div className="relative w-full max-w-[540px] max-h-[85vh] flex flex-col rounded-[20px] border border-[#e4dbd2] bg-white p-5 shadow-[0_20px_50px_rgba(58,40,25,0.18)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f2ece6]">
          <h2 className="text-[18px] font-extrabold text-[#211913] m-0">
            Import from Previous Menu
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8dfd5] bg-[#fffdfa] text-[#746a62] hover:bg-[#faf8f6] hover:text-[#cf6e38] transition focus:outline-none active:scale-90"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89d93]">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="h-[42px] w-full rounded-full border border-[#d7cec4] bg-[#fdfcfb] pl-10 pr-4 text-[14px] text-[#1f1814] outline-none transition placeholder:text-[#a89d93] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
            placeholder="Search orders, menus, or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Packages List */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3.5 scrollbar-thin">
          {filteredMenus.length ? (
            filteredMenus.map((menu) => {
              const menuItems = menu.menuItems || [];
              const allSelected = menuItems.length > 0 && menuItems.every((item) =>
                selectedItems.some((si) => si.key === `${menu.id}-${item.id}`)
              );

              return (
                <div
                  key={menu.id}
                  className="border border-[#e8dfd5] rounded-xl overflow-hidden bg-[#fffdfb] transition-all duration-200"
                >
                  {/* Package Card Header */}
                  <div
                    onClick={() => toggleExpandMenu(menu.id)}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#fff9f4] transition"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <img
                        src={menu.image || "/heroBg.webp"}
                        alt={menu.title}
                        className="w-[54px] h-[54px] object-cover rounded-lg mr-3 bg-[#f2ece6]"
                      />
                      <div className="min-w-0 pr-2">
                        <h3 className="m-0 text-[15px] font-extrabold text-[#211913] truncate">
                          {menu.title}
                        </h3>
                        <p className="m-0 mt-0.5 text-[12px] text-[#746a62] line-clamp-2 leading-relaxed">
                          {menu.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectAll(menu);
                        }}
                        className={`text-[12px] font-bold px-2 py-1 rounded transition border cursor-pointer ${
                          allSelected
                            ? "bg-[#edf9ef] border-[#c7ebd0] text-[#237a39]"
                            : "bg-white border-[#d6cdc4] text-[#746a62] hover:bg-[#fcfaf7]"
                        }`}
                      >
                        {allSelected ? "All Selected" : "Select All"}
                      </button>
                      <span className="text-[#8c7f73]">
                        {expandedMenuIds[menu.id] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items List inside Package Card */}
                  {expandedMenuIds[menu.id] && (
                    <div className="border-t border-[#f2ece6] bg-white px-3 py-1 space-y-0.5">
                      {menuItems.length ? (
                        menuItems.map((item) => {
                          const itemKey = `${menu.id}-${item.id}`;
                          const isItemSelected = selectedItems.some((si) => si.key === itemKey);

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleSelectItem(item, menu)}
                              className="flex items-center justify-between py-2.5 border-b border-[#f9f5f0] last:border-b-0 hover:bg-[#fffdfa] rounded px-1.5 cursor-pointer transition"
                            >
                              <div className="flex items-center flex-1">
                                <input
                                  type="checkbox"
                                  checked={isItemSelected}
                                  onChange={() => {}}
                                  className="accent-[#cf6e38] h-4.5 w-4.5 rounded border-[#d6cdc4] cursor-pointer"
                                />
                                <img
                                  src={item.image || "/heroBg.webp"}
                                  alt={item.title}
                                  className="w-10 h-10 object-cover rounded-md ml-3 mr-3.5 bg-[#f2ece6]"
                                />
                                <span className="text-[14px] font-extrabold text-[#211913]">
                                  {item.title}
                                </span>
                              </div>
                              <div className="text-[#c1b5a9] pr-1">
                                <ChevronRight size={14} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[12px] text-center py-4 text-[#8a7d72]">
                          No items in this menu.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-[13px] font-bold text-[#746a62] m-0">No matching packages found</p>
              <p className="text-[11px] text-[#aea39a] mt-1 m-0">Try searching with a different term.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-[#f2ece6] flex justify-end gap-2.5">
          <button
            onClick={() => {
              setSelectedItems([]);
              setSearchTerm("");
              onClose();
            }}
            type="button"
            className="h-[38px] px-4 rounded-lg border border-[#d6cdc4] bg-white text-[13px] font-extrabold text-[#3a2e25] hover:bg-[#faf8f6] active:scale-95 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedItems.length === 0}
            type="button"
            className="h-[38px] px-5 rounded-lg bg-[#cf6e38] text-[13px] font-extrabold text-white hover:bg-[#bf622f] active:scale-95 transition disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
          >
            Add Selected ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}
