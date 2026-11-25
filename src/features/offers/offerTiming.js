// Missing optional timing fields preserve compatibility with older quotes.
export function quoteTiming(quote, now = Date.now()) {
 if (!quote) return 'inactive';
 const end = Date.parse(quote.expiresAt);
 if (!Number.isFinite(end) || end <= now) return 'expired';
 const start = quote.startsAt == null ? null : Date.parse(quote.startsAt);
 if (start !== null && !Number.isFinite(start)) return 'inactive';
 if (quote.isScheduled === true || (start !== null && start > now)) return 'scheduled';
 return quote.isActive === false ? 'inactive' : 'active';
}
