import { initialCreateMenuItems } from "../menuConstants";

export function createEmptyMenuItem() {
  return {
    id: `draft-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    allergens: [],
    image: null,
  };
}

export function getInitialMenuState() {
  return {
    id: "",
    menuTitle: "",
    description: "",
    category: "",
    productType: "",
    menuTypes: [],
    coverImage: null,
    galleryImages: [],
    selectedDays: [],
    leadTime: "24",
    blackoutDate: "",
    selectedDietary: [],
    customDietary: "",
    pricingMode: "",
    basePrice: "",
    minimumGuests: "",
    menuItems: initialCreateMenuItems.map((item) => ({ ...item })),
    addOnSearch: "",
    selectedAddOnIds: [],
    status: "draft",
    hasAvailabilityWindow: false,
    availabilityStart: "",
    availabilityEnd: "",
    isImportModalOpen: false,
    isAddCategoryModalOpen: false,
    isAddMealTypeModalOpen: false,
    isAddAllergenModalOpen: false,
  };
}

export function toAddOnDisplay(addOn) {
  return {
    ...addOn,
    image: addOn.coverImage?.fileUrl || addOn.image || "/heroBg.webp",
    price: addOn.priceWithTax || addOn.price || "",
  };
}

export function toImportedMenuItem(item, index) {
  return {
    id: `imported-item-${Date.now()}-${index}`,
    title: item.title || "",
    allergens: Array.isArray(item.allergens)
      ? item.allergens
          .map((allergen) => {
            if (typeof allergen === "string") {
              return allergen;
            }

            return allergen?.id || allergen?.slug || "";
          })
          .filter(Boolean)
      : [],
    image: item.imageUrl || item.image
      ? {
          fileId: item.fileId || "",
          fileUrl: item.imageUrl || item.image,
        }
      : null,
  };
}
