export function localizeAddOnError(error, t, language, fallback = "save") {
  const issue = error?.errors?.find((item) => item?.message) || error;
  const message = String(typeof issue === "string" ? issue : issue?.message || "").trim();
  const code = String(issue?.code || error?.code || "").toUpperCase();
  const field = String(issue?.field || "").toLowerCase();
  if (message.startsWith("addOnErrors.")) return t(message);
  let key;
  if (/INDEPENDENT_DISABLED/.test(code) || /independent add-ons require the backend update/i.test(message)) key = "disabled";
  else if (/failed to fetch|networkerror|network request|load failed|timeout|timed out/i.test(message)) key = "network";
  else if (/UNAUTHENTICATED|AUTH_REQUIRED|UNAUTHORIZED/.test(code) || /not authorized|sign in|log in|session expired|token.*expired/i.test(message)) key = "session";
  else if (/positive whole number|positive integer/i.test(message) && /guest/i.test(message)) key = "minimumGuests";
  else if (/GUEST/.test(code) || field === "minimumguests" || /minimum.*guests?|guests?.*minimum/i.test(message)) key = "guestMinimum";
  else if (/MINIMUM_QUANTITY/.test(code) || field === "minimumquantity" || /minimum.*quantity/i.test(message)) key = "quantityMinimum";
  else if (/attach|unlink|included in.*menu/i.test(message)) key = "attached";
  else if (field === "name" || /name.*required/i.test(message)) key = "name";
  else if (/price/.test(field) || /price.*(?:required|invalid|positive|negative|zero)/i.test(message)) key = "price";
  else if (/allergen/.test(field) || /invalid.*allergen/i.test(message)) key = "allergens";
  if (key) return t(`addOnErrors.${key}`);
  if (String(language).startsWith("en") && message) return message;
  return t(`addOnErrors.${fallback}`);
}
