export const independentAddOnsEnabled = import.meta.env?.VITE_INDEPENDENT_ADDONS_ENABLED !== "false";

export function isIndependentAddOn(item) {
  return String(item?.addOnType || "DEPENDENT").toUpperCase() === "INDEPENDENT";
}

export function validateStandaloneFields(form) {
  if (!isIndependentAddOn(form)) return "";
  for (const key of ["minimumGuests"]) {
    if (!Number.isInteger(Number(form[key])) || Number(form[key]) < 1) {
      return "addOnErrors.minimumGuests";
    }
  }
  return "";
}

export function standaloneInput(form) {
  return {
    addOnType: isIndependentAddOn(form) ? "INDEPENDENT" : "DEPENDENT",
    ...(isIndependentAddOn(form) ? {
      pricingType: "per-person",
      minimumGuests: Number(form.minimumGuests),
      minimumQuantity: 1,
      allergens: form.allergens || [],
    } : {}),
  };
}

export const addOnFields = independentAddOnsEnabled
  ? "addOnType pricingType minimumGuests minimumQuantity allergens { id name slug }"
  : "";
