export function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function isPastDateValue(value) {
  const normalized = `${value ?? ""}`.trim();

  if (!normalized) {
    return false;
  }

  return normalized < getTodayDateValue();
}

export function isValidEstablishedYear(value) {
  const normalized = `${value ?? ""}`.trim();

  if (!normalized) {
    return true;
  }

  if (!/^\d{4}$/.test(normalized)) {
    return false;
  }

  const year = Number.parseInt(normalized, 10);
  const currentYear = getCurrentYear();

  return year >= 1900 && year <= currentYear;
}

export function sanitizeYearInput(value) {
  return `${value ?? ""}`.replace(/\D/g, "").slice(0, 4);
}
