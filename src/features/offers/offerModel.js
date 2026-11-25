import { quoteTiming } from './offerTiming.js';
export const OPEN_STATUSES = new Set(['WAITING_FOR_VENDOR', 'OFFERED', 'ACCEPTED']);
export function moneyToOre(value) {
  const text = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(amount) ? amount : null;
}
export function validQuote(value, normalPrice) {
  const amount = moneyToOre(value), normal = moneyToOre(normalPrice);
  return amount !== null && normal !== null && amount > 0 && amount < normal;
}
export function redactContact(message = '') {
  return String(message)
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[hidden]')
    .replace(/(?:https?:\/\/|www\.)[^\s]+|\b(?:[a-z0-9-]+\.)+(?:com|no|net|org|io|co|me|app|eu|uk)(?:\/[^\s]*)?/gi, '[hidden]')
    .replace(/(?:\+\d{1,3}[\s.-]?)?(?:\(?\d\)?[\s.-]?){8,15}/g, '[hidden]');
}
export function hasContactDetails(message) { return redactContact(message) !== String(message); }
export function isOfferCurrent(offer, now = Date.now()) {
  return Boolean(offer?.quote?.revision && ['OFFERED', 'ACCEPTED'].includes(offer.status) && quoteTiming(offer.quote, now) === 'active');
}
export function cartSignature(summary) {
  return JSON.stringify((summary?.items || []).map(item => ({
    id: String(item.productId), quantity: Number(item.quantity || 1), personCount: item.personCount ?? null,
    options: item.selectedOptions || {}, addons: item.selectedAddons || [], isAddOn: Boolean(item.isAddOn),
  })));
}
export function offerMatchesCheckout(binding, cart, form) {
  return Boolean(binding && binding.vendorId === String(cart.vendor.id) && binding.deliveryDate === form.date &&
    binding.deliveryTime.slice(0,5) === String(form.time || '').slice(0,5) &&
    binding.personCount === Number(cart.orderSummary.personCount) && binding.personCount === Number(form.personCount ?? cart.orderSummary.personCount) && binding.postalCode === String(form.deliveryPostalCode || '') &&
    binding.itemsSignature === cartSignature(cart.orderSummary));
}
export function restoreCatalogueSummary(summary) {
  return { ...summary, offer: null, offerRemoved:true, pricing: null, availability: null, previewItems: [],
    items: summary.items.map(item => item.catalogueUnitPrice == null ? item : { ...item, unitPrice: item.catalogueUnitPrice, price: 0 }) };
}
export function acceptedOfferCart(request) {
  if (request?.status !== 'ACCEPTED' || !isOfferCurrent(request) || !request.checkoutSnapshot?.items?.length || !request.checkoutSnapshot.vendor?.slug) throw new Error('Invalid accepted offer snapshot.');
  const snapshot = request.checkoutSnapshot;
  const main=snapshot.items.filter(item=>!item.isAddOn);
  if(main.length!==1 || Number(main[0].quantity)!==1 || main[0].pricingType!=="per-person" || Number(main[0].unitPrice)!==Number(request.quote.pricePerPerson) || snapshot.items.some(item=>!Number.isFinite(Number(item.catalogueUnitPrice)) || Number(item.catalogueUnitPrice)<=0)) throw new Error("Invalid negotiated cart prices.");
  const items = snapshot.items.map(item => ({ ...item, id: item.id || item.productId, price: 0, details: [], isAddOn: Boolean(item.isAddOn) }));
  const summary = { items, deliveryDate: request.deliveryDate, deliveryTime: request.deliveryTime, personCount: request.personCount, deliveryAddress: request.postalCode, tipRate:0, vendorNote:'', pricing:null, previewItems:[], availability:null };
  summary.offer = { requestId:request.id, requestRevision:request.revision, quoteRevision:request.quote.revision, expiresAt:request.quote.expiresAt, startsAt:request.quote.startsAt, vendorId:String(snapshot.vendor.id), deliveryDate:request.deliveryDate, deliveryTime:request.deliveryTime, personCount:request.personCount, postalCode:request.postalCode, itemsSignature:cartSignature(summary), pricePerPerson:request.quote.pricePerPerson };
  return { vendor:snapshot.vendor, orderSummary:summary };
}

export function verifyOfferPreview(preview,offer) {
 const evidence=preview?.offerBinding;
 const expectedFood=Number(offer.pricePerPerson)*offer.personCount;
 const expectedTotal=expectedFood+Number(preview?.pricing?.addOnsTotal||0)+Number(preview?.pricing?.deliveryFee||0)+Number(preview?.pricing?.tipAmount||0)+Number(preview?.pricing?.serviceFee||0);
 return Boolean(preview?.pricing && evidence?.requestId===offer.requestId && evidence?.quoteRevision===offer.quoteRevision && Number.isFinite(Number(evidence?.foodTotal)) && Math.abs(Number(evidence.foodTotal)-expectedFood)<=.02 && Number.isFinite(Number(preview.pricing.grandTotal)) && Math.abs(Number(preview.pricing.grandTotal)-expectedTotal)<=.02);
}
