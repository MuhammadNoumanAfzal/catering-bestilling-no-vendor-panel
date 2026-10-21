export function getInitialAddOnState() {
  return {
    addOnType: "DEPENDENT",
    pricingType: "per-person",
    minimumGuests: "1",
    minimumQuantity: "1",
    allergens: [],
    id: "",
    addOnName: "",
    description: "",
    price: "",
    categories: [],
    customCategory: "",
    image: null,
    mealTypes: [],
    selectedDietary: [],
    availableImmediately: true,
    status: "draft",
    isAddMealTypeModalOpen: false,
  };
}
