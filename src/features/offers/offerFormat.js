export function formatMoney(value, text) {
  return new Intl.NumberFormat(text('en-GB', 'nb-NO'), { style: 'currency', currency: 'NOK', maximumFractionDigits: 2 }).format(Number(value));
}
function parts(date, text, options) {
  return Object.fromEntries(new Intl.DateTimeFormat(text('en-GB', 'nb-NO'), options).formatToParts(date).map(p => [p.type, p.value]));
}
export function deliveryLabel(value, text) {
  const date = new Date(String(value) + 'T12:00:00Z');
  if (Number.isNaN(date.getTime())) return value;
  const p = parts(date, text, {weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Oslo'});
  return p.weekday+' '+p.day+' '+p.month+' '+p.year;
}
export function dateTime(value, text) {
  const raw=String(value||'');
  const timestamp=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)&&!/(Z|[+-]\d{2}:?\d{2})$/i.test(raw)?raw+'Z':raw;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '\u2014';
  const p=parts(date,text,{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Europe/Oslo'});
  return p.weekday+' '+p.day+' '+p.month+' '+p.year+', '+p.hour+':'+p.minute+' '+text('(Norway time)','(norsk tid)');
}
