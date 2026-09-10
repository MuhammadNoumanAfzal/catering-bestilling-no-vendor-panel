import i18n from "../../i18n";

export function formatReviewAge(value) {
  const text = String(value || "");
  if (/^just now$/i.test(text.trim())) return i18n.t("reviews.justNow");
  const match = text.trim().match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i);
  if (!match) return text;
  return new Intl.RelativeTimeFormat(i18n.language === "nb" ? "nb-NO" : "en-GB", { numeric: "always" }).format(-Number(match[1]), match[2].toLowerCase());
}

export function formatReviewDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(i18n.language === "nb" ? "nb-NO" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
