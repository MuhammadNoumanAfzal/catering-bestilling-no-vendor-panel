export const menuManagementTabs = ["All", "Active", "Draft", "Paused", "Add-ons"];

export const menuSortOptions = ["Latest", "Oldest", "Highest Price", "Lowest Price"];

export const menuCategoryOptions = ["Breakfast", "Lunch", "Dinner", "Dessert", "Corporate"];
export const menuTypeOptions = ["Per Person"];
export const leadTimeOptions = ["24", "48", "72"];
export const allergenOptions = ["Eggs", "Dairy", "Nuts", "Soy", "Gluten"];
export const pricingModes = ["Per Person"];
export const dietaryOptions = ["Vegetarian", "Halal", "Gluten-Free", "Vegan"];
export const availabilityDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const addOnCategoryOptions = [
  "Beverages",
  "Desserts",
  "Sides",
  "Snacks",
  "Extras",
];

export const initialCreateMenuItems = [
  { id: 1, title: "Grilled Chicken", allergen: "Eggs", image: "" },
];

export const optionalAddOns = [
  { id: 1, name: "Spicy Muhammara Dip", price: "10 kr", image: "/heroBg.webp" },
  { id: 2, name: "Grilled Arayas", price: "10 kr", image: "/heroBg.webp" },
  { id: 3, name: "Fresh Fattoush Salad", price: "10 kr", image: "/heroBg.webp" },
  { id: 4, name: "Garlic Sauce", price: "20 kr", image: "/heroBg.webp" },
  { id: 5, name: "Mixed Grill Kebab", price: "8 kr", image: "/heroBg.webp" },
  { id: 6, name: "Spicy Muhammara Dip", price: "5 kr", image: "/heroBg.webp" },
  { id: 7, name: "Spicy Muhammara Dip", price: "10 kr", image: "/heroBg.webp" },
];

export const menuManagementItems = [
  {
    id: "menu-101",
    title: "Grand Wedding Banquet",
    description:
      "A luxurious 5-course dining experience featuring premium starters, slow-roast lamb, and a custom dessert bar.",
    price: "85 kr per person",
    meta: "12 menu included",
    image: "/heroBg.webp",
    status: "Active",
    badge: "Catering",
    tone: "active",
    category: "Corporate",
    menuType: "Per Person",
    coverImage: "/heroBg.webp",
    galleryImage: "/heroBg.webp",
    selectedDays: ["Su", "Mo", "Tu", "Fr"],
    leadTime: "24",
    blackoutDate: "",
    selectedDietary: ["Vegetarian", "Halal"],
    customDietary: "",
    minimumGuests: "20",
    menuItems: [
      { id: 1, title: "Grilled Chicken", allergen: "Eggs", image: "/heroBg.webp" },
      { id: 2, title: "Saffron Rice", allergen: "Gluten", image: "/heroBg.webp" },
    ],
    selectedAddOnIds: [1, 2],
  },
  {
    id: "menu-102",
    title: "Corporate Power Lunch",
    description:
      "Fresh artisanal sandwiches, organic grain bowls, and seasonal fruit platters designed for office teams.",
    price: "50 kr per person",
    meta: "12 menu included",
    image: "/heroBg.webp",
    status: "Active",
    badge: "Corporate",
    tone: "active",
    category: "Lunch",
    menuType: "Fixed Package",
    coverImage: "/heroBg.webp",
    galleryImage: "/heroBg.webp",
    selectedDays: ["Mo", "Tu", "We", "Th"],
    leadTime: "48",
    blackoutDate: "",
    selectedDietary: ["Gluten-Free"],
    customDietary: "",
    minimumGuests: "35",
    menuItems: [
      { id: 1, title: "Club Sandwich", allergen: "Dairy", image: "/heroBg.webp" },
    ],
    selectedAddOnIds: [3, 4],
  },
  {
    id: "menu-103",
    title: "Backyard Summer BBQ",
    description:
      "Slow-smoked brisket, peri peri corn, and charred vegetables ideal for relaxed outdoor gatherings.",
    price: "250 kr per person",
    meta: "15 menu included",
    image: "/heroBg.webp",
    status: "Paused",
    badge: "Party",
    tone: "paused",
    category: "Dinner",
    menuType: "Tray Based",
    coverImage: "/heroBg.webp",
    galleryImage: "",
    selectedDays: ["Fr", "Sa"],
    leadTime: "72",
    blackoutDate: "",
    selectedDietary: ["Halal"],
    customDietary: "",
    minimumGuests: "60",
    menuItems: [
      { id: 1, title: "Smoked Brisket", allergen: "Soy", image: "/heroBg.webp" },
    ],
    selectedAddOnIds: [5],
  },
  {
    id: "menu-104",
    title: "Grand Wedding Banquet",
    description:
      "A luxurious 5-course dining experience featuring premium starters, slow-roast lamb, and a custom dessert bar.",
    price: "85 kr per person",
    meta: "12 menu included",
    image: "/heroBg.webp",
    status: "Active",
    badge: "Catering",
    tone: "active",
    category: "Corporate",
    menuType: "Per Person",
    coverImage: "/heroBg.webp",
    galleryImage: "",
    selectedDays: ["Su", "Mo", "Tu"],
    leadTime: "24",
    blackoutDate: "",
    selectedDietary: ["Vegetarian"],
    customDietary: "",
    minimumGuests: "20",
    menuItems: [
      { id: 1, title: "Lamb Chops", allergen: "Nuts", image: "/heroBg.webp" },
    ],
    selectedAddOnIds: [6],
  },
  {
    id: "menu-105",
    title: "Corporate Power Lunch",
    description:
      "Fresh artisanal sandwiches, organic grain bowls, and seasonal fruit platters designed for office teams.",
    price: "80 kr per person",
    meta: "11 menu included",
    image: "/heroBg.webp",
    status: "Draft",
    badge: "Corporate",
    tone: "draft",
    category: "Lunch",
    menuType: "Per Person",
    coverImage: "/heroBg.webp",
    galleryImage: "",
    selectedDays: ["Mo", "We"],
    leadTime: "24",
    blackoutDate: "",
    selectedDietary: ["Vegan"],
    customDietary: "Low sodium",
    minimumGuests: "15",
    menuItems: [
      { id: 1, title: "Pasta Primavera", allergen: "Gluten", image: "/heroBg.webp" },
    ],
    selectedAddOnIds: [2, 7],
  },
];
