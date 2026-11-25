import { validQuote } from './offerModel.js';
import { quoteExpiresAt } from './quoteDuration.js';

export function requestedPriceQuote(request, expiry, now = Date.now()) {
  const expires = Date.parse(expiry);
  if (!['WAITING_FOR_VENDOR', 'OFFERED', 'WITHDRAWN'].includes(request?.status) ||
      !request.permissions?.canQuote || !validQuote(request.targetPricePerPerson, request.normalPricePerPerson) ||
      !Number.isFinite(expires) || expires <= now) return null;
  return { pricePerPerson: String(request.targetPricePerPerson).replace(',', '.'), expiresAt: new Date(expires).toISOString(), message: null };
}

export function suggestedQuoteExpiry(now = Date.now()) { return quoteExpiresAt(5, now); }
