export const menuManagementTabs = ["All", "Active", "Draft", "Paused", "Add-ons"];

export const menuSortOptions = ["Latest", "Oldest", "Highest Price", "Lowest Price"];

export const allergenOptions = [];

export const dietaryOptions = ["Vegetarian", "Halal", "Gluten-Free", "Vegan"];

export const leadTimeOptions = [
  { label: "24 hours", value: "24" },
  { label: "48 hours", value: "48" },
  { label: "72 hours", value: "72" },
];

export const availabilityDays = [
  { label: "Su", value: "su" },
  { label: "Mo", value: "mo" },
  { label: "Tu", value: "tu" },
  { label: "We", value: "we" },
  { label: "Th", value: "th" },
  { label: "Fr", value: "fr" },
  { label: "Sa", value: "sa" },
];

export const initialCreateMenuItems = [
  { id: "draft-item-1", title: "", description: "", allergens: [], image: null },
];

export const statusLabelMap = {
  active: "Active",
  draft: "Draft",
  paused: "Paused",
};

export const pricingTypeLabelMap = {
  per_person: "Per Person",
  fixed_package: "Fixed Package",
  tray_based: "Tray Based",
};

export function formatChoiceLabel(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
