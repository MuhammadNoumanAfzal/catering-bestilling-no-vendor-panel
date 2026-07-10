function normalizeString(value) {
  return value == null ? "" : String(value).trim();
}

function parseDateString(dateStr) {
  const normalized = normalizeString(dateStr);

  if (!normalized || /unavailable/i.test(normalized)) {
    return new Date(Number.NaN);
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const parts = normalized.split(/\s+/);
  if (parts.length === 3) {
    const day = Number.parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = Number.parseInt(parts[2], 10);
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const monthIndex = months.indexOf(monthName);

    if (monthIndex >= 0 && Number.isFinite(day) && Number.isFinite(year)) {
      return new Date(year, monthIndex, day);
    }
  }

  return new Date(Number.NaN);
}

function normalizeTimeString(rawTime) {
  const normalized = normalizeString(rawTime);

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
    return normalized.length === 5 ? `${normalized}:00` : normalized;
  }

  const twelveHourMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!twelveHourMatch) {
    return "";
  }

  let hours = Number.parseInt(twelveHourMatch[1], 10);
  const minutes = Number.parseInt(twelveHourMatch[2], 10);
  const meridiem = twelveHourMatch[3].toUpperCase();

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  } else if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export function parseScheduledOrderDateTime(orderLike) {
  const rawDate =
    normalizeString(orderLike?.eventDateRaw) ||
    normalizeString(orderLike?.raw?.eventDate) ||
    normalizeString(orderLike?.raw?.deliveryDate) ||
    normalizeString(orderLike?.raw?.placedAt) ||
    normalizeString(orderLike?.raw?.createdOn);
  const rawTime =
    normalizeString(orderLike?.time) ||
    normalizeString(orderLike?.raw?.eventTime) ||
    normalizeString(orderLike?.logistics?.deliveryWindow);

  if (rawDate) {
    const normalizedTime = normalizeTimeString(rawTime) || "00:00:00";
    const isoCandidate = `${rawDate}T${normalizedTime}`;
    const parsedIso = new Date(isoCandidate);

    if (!Number.isNaN(parsedIso.getTime())) {
      return parsedIso;
    }
  }

  const fallbackDate = parseDateString(orderLike?.date);
  if (Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  const fallbackTime = normalizeTimeString(rawTime);
  if (fallbackTime) {
    const [hours, minutes, seconds] = fallbackTime
      .split(":")
      .map((value) => Number.parseInt(value, 10));
    fallbackDate.setHours(hours, minutes, seconds || 0, 0);
  }

  return fallbackDate;
}

export function formatScheduledDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "the scheduled delivery time";
  }

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getEarlyDeliveryBlockMessage(orderLike) {
  const scheduledAt = parseScheduledOrderDateTime(orderLike);
  if (Number.isNaN(scheduledAt.getTime())) {
    return "";
  }

  if (Date.now() >= scheduledAt.getTime()) {
    return "";
  }

  return `This order is scheduled for ${formatScheduledDateTime(scheduledAt)}. It cannot be marked delivered before the delivery time.`;
}
