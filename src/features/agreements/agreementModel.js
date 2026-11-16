export const statuses = {
  PENDING_SIGNATURE: "Pending signature",
  PENDING_APPROVAL: "Waiting for approval",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  SUPERSEDED: "Replaced",
  REVOKED: "Revoked",
};
export function canSign(a) {
  return Boolean(
    a?.id &&
      a?.revision &&
      a?.documentSha256 &&
      a?.canSign === true &&
      a?.status === "PENDING_SIGNATURE",
  );
}
export function canGoLive(a) {
  return a?.status === "ACTIVE" && a?.canGoLive === true;
}
export function canReview(a) {
  return (
    a?.status === "PENDING_APPROVAL" &&
    a?.checks?.companyFound === true &&
    a?.checks?.companyNameMatches === true &&
    a?.checks?.emailVerified === true &&
    a?.checks?.documentIntegrityValid === true
  );
}
export function safeDocumentUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function dateLabel(value) {
  if (!value) return "Not yet";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "Unavailable"
    : new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Oslo",
      }).format(d) + " (Oslo)";
}
export function statusLabel(value) {
  return statuses[value] || "Unavailable";
}
