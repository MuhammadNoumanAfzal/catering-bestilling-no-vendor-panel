export function hasRequiredMenuItems(items, status) {
  if (String(status).toLowerCase() === "draft") return true;
  return Array.isArray(items) && items.some((item) => String(item?.title || "").trim());
}
