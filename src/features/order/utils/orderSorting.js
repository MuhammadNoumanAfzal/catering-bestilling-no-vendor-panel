function timestamp(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const time = value ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : null;
}

function latest(...values) {
  const times = values.flat().map(timestamp).filter((value) => value != null);
  return times.length ? Math.max(...times) : null;
}

function historyTime(raw, statuses) {
  return latest((raw.statuses || [])
    .filter((entry) => statuses.includes(String(entry.status).toLowerCase().replace(/[ _-]/g, "")))
    .map((entry) => entry.createdOn));
}

function sortTime(row, tab) {
  const raw = row.raw || {};
  const created = timestamp(raw.createdOn || raw.placedAt);
  if (["Accepted", "Pending", "Upcoming"].includes(tab)) {
    return timestamp(raw.eventDate ? `${raw.eventDate.split("T")[0]}T${raw.eventTime || "00:00:00"}` : raw.deliveryDate);
  }
  if (tab === "Modified") {
    return latest(raw.pendingModificationRequest?.createdOn, raw.latestModificationRequest?.createdOn,
      raw.pendingVendorAdjustment?.createdOn, raw.latestVendorAdjustment?.createdOn,
      historyTime(raw, ["modified", "modificationrequested", "adjustmentrequested"])) ??
      timestamp(raw.updatedAt || raw.updatedOn) ?? created;
  }
  if (tab === "Delivered") return latest(raw.deliveredAt, historyTime(raw, ["delivered", "completed"])) ?? created;
  if (tab === "Canceled") return latest(raw.canceledAt, raw.cancelledAt, raw.rejectedAt,
    historyTime(raw, ["canceled", "cancelled", "rejected", "reject"])) ?? created;
  return created;
}

export function sortOrderRows(rows, tab) {
  const ascending = ["Accepted", "Pending", "Upcoming"].includes(tab);
  return [...rows].sort((a, b) => {
    const first = sortTime(a, tab);
    const second = sortTime(b, tab);
    if (first == null && second != null) return 1;
    if (second == null && first != null) return -1;
    if (first !== second) return ascending ? first - second : second - first;
    return String(b.rawId || b.id).localeCompare(String(a.rawId || a.id), undefined, { numeric: true });
  });
}
