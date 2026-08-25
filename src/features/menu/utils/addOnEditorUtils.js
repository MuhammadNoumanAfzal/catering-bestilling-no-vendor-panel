export function getInitialAddOnState() {
  return {
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
