export function formatMoney(value, text) {
  return new Intl.NumberFormat(text('en-GB', 'nb-NO'), { style: 'currency', currency: 'NOK', maximumFractionDigits: 2 }).format(Number(value));
}
export function deliveryLabel(value, text) {
  const date = new Date(String(value) + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(text('en-GB', 'nb-NO'), { day: 'numeric', month: 'short', year: 'numeric' });
}
export function dateTime(value, text) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '\u2014' : date.toLocaleString(text('en-GB', 'nb-NO'), { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Oslo' });
}
