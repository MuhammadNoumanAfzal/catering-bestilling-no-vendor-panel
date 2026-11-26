export const OFFER_VALIDITY_DAYS = [3, 5, 7];
export const MAX_OFFER_VALIDITY_DAYS = 30;
export function validOfferDuration(days) {
 return /^(?:[1-9]|[12][0-9]|30)$/.test(String(days));
}
export function quoteExpiresAt(days = 5, now = Date.now()) {
 if (!validOfferDuration(days) || !Number.isFinite(now)) throw new Error('Invalid offer validity');
 return new Date(now + Number(days) * 86400000).toISOString();
}
