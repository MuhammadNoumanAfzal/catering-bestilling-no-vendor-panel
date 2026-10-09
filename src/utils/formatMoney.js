export function parseMoney(value) {
  if (value && typeof value === "object") return parseMoney(value.amount ?? value.formatted);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  let text = String(value ?? "").trim().replace(/\u2212/g, "-").replace(/,-$/, "").replace(/[^\d,.-]/g, "");
  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  const lastSeparator = Math.max(lastComma, lastDot);
  const decimals = text.length - lastSeparator - 1;
  if (lastSeparator >= 0 && decimals >= 1 && decimals <= 2) {
    text = text.slice(0, lastSeparator).replace(/[.,]/g, "") + "." + text.slice(lastSeparator + 1);
  } else {
    text = text.replace(/[.,]/g, "");
  }
  const amount = Number(text);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatMoney(value) {
  const amount = Math.round((parseMoney(value) + Number.EPSILON) * 100) / 100;
  const whole = Number.isInteger(amount);
  const formatted = new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount).replace(/\u00a0/g, " ").replace(/\u2212/g, "-");
  return whole ? `${formatted},-` : formatted;
}
