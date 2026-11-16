export function occasionIds(values = []) {
  return [...new Set((Array.isArray(values) ? values : (values?.edges || []).map(edge => edge?.node)).map(value => typeof value === 'string' ? value : value?.id).filter(Boolean))];
}
export function productOccasionInput(form) {
  return String(form.addOnType).toUpperCase() === 'INDEPENDENT' ? { occasions: occasionIds(form.selectedOccasions) } : {};
}
