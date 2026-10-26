export function isSingleProduct(item) {
  return String(item.addOnType || item.rawAddon?.addOnType || item.rawMenu?.addOnType || "").toUpperCase() === "INDEPENDENT";
}

export function getMenuGroups(tab, menus, addOns) {
  const groups = [
    { type: "menus", items: menus.filter((item) => !isSingleProduct(item)) },
    { type: "addOns", items: addOns.filter((item) => !isSingleProduct(item)) },
    { type: "singleProducts", items: addOns.filter(isSingleProduct) },
  ];
  if (tab === "All") return [groups[0]];
  if (tab === "Add-ons") return [groups[1]];
  if (tab === "Single Products") return [groups[2]];
  return groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => String(item.status).toLowerCase() === tab.toLowerCase()),
  }));
}
