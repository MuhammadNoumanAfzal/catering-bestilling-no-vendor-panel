export const OFFER_VALIDITY_DAYS = [3, 5, 7];
export function quoteExpiresAt(days = 5, now = Date.now()) {
  const duration = Number(days);
  if (!OFFER_VALIDITY_DAYS.includes(duration) || !Number.isFinite(now)) throw new Error('Invalid offer validity');
  return new Date(now + duration * 86400000).toISOString();
}
