## Live frontend integration update ? 16 November 2026

All 13 operation documents passed deployed GraphQL field/input validation with
root resolvers skipped (no business reads or mutations executed).
Offer queries/mutations are present on the deployed public schema. Frontend now uses
actual OfferPreviewPricing (foodTotal/grossTotal/netTotal/taxTotal/deliveryFee/
minimumOrderShortfall/catalogueDiscount/tipAmount) and OfferPaymentGuard
(allowed/code/message/offerRequestId/quoteRevision).

The adapter verifies bound food price, line totals and payable gross arithmetic, then
maps the response to existing checkout display fields. Minimum-order shortfall is
shown explicitly, not silently dropped. Guard checks run for all pending payment
orders, including cross-device orders without browser markers. Bound requests are
read again to verify quote revision, status and expiry before embedding/retrying.
VITE_OFFERS_BACKEND_READY is no longer needed to enable those checks.

The schema/operations files reflect these live differences; the requirements below
retain the original business/financial obligations. Field examples for the previous
pricing/guard shape below are historical; use the updated operations file.
Public schema validation does NOT establish authenticated business correctness.
Real customer/vendor acceptance, payment races, reminders, moderation alerts,
refunds and commission accounting still require backend/integration evidence.
No production request/order/payment was created during frontend schema validation.

---

﻿# Request an offer — backend implementation handoff

Frontend implementation: customer and vendor React apps, English + Norwegian Bokmål.
IMPORTANT: these are PROPOSED operations, not existing deployed APIs. Public schema
inspection on 16 November 2026 found no offer/quote operations. Do not report this
feature as live until the API below and authenticated acceptance tests pass.

Files to use:
- REQUEST_AN_OFFER_SCHEMA.graphql: required new SDL and existing-input extensions.
- REQUEST_AN_OFFER_OPERATIONS.graphql: exact frontend operation documents.
- src/features/offers/offerApi.js: shared request operations.
- Customer src/features/offers/offerCheckout.js and offerPayment.js: payment contracts.

## 1. Authenticated queries

myOfferRequests(status, page, pageSize): OfferRequestPage!
myOfferRequest(id): MenuOfferRequest!
vendorOfferRequests(status, page, pageSize): OfferRequestPage!
vendorOfferRequest(id): MenuOfferRequest!
orderOfferSummaries(orderIds): [OrderOfferSummary!]!
offerPaymentGuard(orderId): OfferPaymentGuard!
offerCheckoutPreview(input: CheckoutPreviewInput!): OfferCheckoutPreview!

JWT identifies customer/vendor. Never accept a browser customerId or tenant selector.
All reads, counts, pages, filters and mutations must enforce the authenticated owner.
Reject foreign request/order IDs safely. A vendor sees only their own requests.
Customer identity exposed before ordering: display name only, not email/phone.
The normal order flow may disclose the appropriate fulfilment contact after ordering.
Page numbers start at 1. Frontend page size is 20. PageCount may be 0 for empty lists.
Keep a stable createdAt DESC, id DESC ordering. Return authoritative totalCount.

## 2. Mutations (all return {request: MenuOfferRequest!})

requestMenuOffer(input: RequestMenuOfferInput!)
- vendorId, menuId, deliveryDate YYYY-MM-DD, deliveryTime HH:mm, personCount,
  postalCode (exactly four digits including leading zero), message,
  optional targetPricePerPerson decimal string, exact selected items/options/add-ons,
  idempotencyKey UUID.
- Derive list price, menu title/vendor and all financial values on the server.
- Only per-person menus/products, quantity 1 for the primary menu in this version.
- Capture original gross NOK price INCLUDING VAT. Validate availability, notice,
  min guests, catalogue membership/options/add-ons, vendor active state and coverage.
- Max one open request per customer/vendor and five globally, enforced atomically.
  WAITING_FOR_VENDOR/OFFERED/ACCEPTED count as open until paid/declined/closed/expired.
- Multiple vendors require separate requests. Never merge one vendor's quote into another.

sendOfferMessage(input: SendOfferMessageInput!)
- requestId, expectedRevision, message, idempotencyKey.
- Sender role is derived from JWT, never client supplied. Return the sanitized thread.
- Sending a negotiation message does not silently accept/reject a quote or create a
  new price. Vendor must explicitly send a quote revision.

sendMenuOffer(input: SendMenuOfferInput!)
- requestId, expectedRevision, pricePerPerson decimal string, expiresAt UTC ISO,
  optional message, idempotencyKey.
- Price MUST be > 0 and STRICTLY LESS than the captured original normal price.
- Decimal money only, maximum two decimals, no float rounding/zero-price loopholes.
- Each new price/expiry issues a new immutable quote.revision and request.revision.
- Expiry must be future and earlier than the event / operational cut-off. Return the
  exact deadline. Vendor uses their local datetime picker; payload is converted to UTC.
- Invalidate previous acceptance and all unpaid payment sessions when revising.
- Existing paid orders cannot be repriced by revising an offer.

acceptMenuOffer(input: AcceptMenuOfferInput!)
- requestId, expectedRevision, quoteRevision, idempotencyKey.
- Atomic check of recipient, request state, latest quote, deadline, availability,
  vendor/menu eligibility. Set ACCEPTED without charging or consuming the offer.
- Also support ACCEPTED/latest-quote re-entry (Continue to checkout) idempotently.
- Return checkoutSnapshot after acceptance, plus existing pending orderId if any.
- If already paid, return ORDERED + orderId. UI navigates to the existing order.

declineMenuOffer(input: DeclineMenuOfferInput!)
- requestId, expectedRevision, idempotencyKey.
- Customer may decline an offer/request; vendor may decline an incoming request.
- Close the open request and invalidate unpaid sessions; never affect paid orders.

All mutation updates use optimistic concurrency AND server-enforced idempotency.
Check idempotency replay BEFORE revision rejection so a lost response can be retried.
Repeated identical key+payload returns the original result. Different payload with an
existing key is an error. Persist audit events and notification jobs transactionally.
Do not return success when email delivery is merely attempted; durable queued delivery
is acceptable with retries. Messages are max 2,000 characters.

## 3. Returned permissions and immutable snapshots

Return permissions.canMessage/canQuote/canAccept/canDecline from backend policy;
frontend hides actions when permissions are absent. Do not rely on UI gating.
quote.revision and request.revision are opaque STRINGS. IDs are strings too.
Allowed statuses: WAITING_FOR_VENDOR, OFFERED, ACCEPTED, DECLINED, EXPIRED,
CLOSED, ORDERED. Menu removal/vendor suspension closes OPEN offers, preserving history.
responseDueAt and quote.expiresAt are separate values. All timestamps UTC ISO. Delivery date/time are Europe/Oslo local slots; reject invalid DST times and resolve overlaps consistently with existing booking rules.

checkoutSnapshot is null until ACCEPTED, populated from trusted server records:
- vendor {id, slug, name}
- items flattened into existing cart lines. Exactly one primary per-person menu,
  quantity 1, unitPrice = agreed gross price, catalogueUnitPrice = captured normal
  gross price, pricingType exactly "per-person". Include productId, name,
  personCount/minimumGuests for standalone products, selectedOptions JSON.
- Add-on rows: isAddOn=true, parentMenuItemId=primary productId, addOnKey, quantity,
  gross unitPrice/catalogueUnitPrice, pricingType="fixed"; no negotiated discount
  unless specifically included in a later extension. Never add a hidden extra menu.
- Existing cart adapters expect stable product IDs. Do not use invoice/display IDs.
Snapshot values are for display/cart reconstruction, NEVER payment authority.
Frontend preserves other vendors' carts and checks out the accepted offer separately.

## 4. Existing checkout / payment integration — mandatory

Extend BOTH CheckoutPreviewInput and PlaceClientOrderInput with:
  offerRequestId: ID
  offerQuoteRevision: String
Leave ordinary checkout unchanged when fields are absent.
Frontend calls offerCheckoutPreview for bound carts and ordinary checkoutPreview for
normal carts. It sends the normal existing payload plus the two binding fields.
Return the SAME pricing/items/availability shape as checkoutPreview, PLUS:
  offerBinding {requestId, quoteRevision, foodTotal}
foodTotal is primary negotiated gross food price * personCount, excludes add-ons.
pricing grandTotal = foodTotal + addOnsTotal + deliveryFee + tipAmount + serviceFee.
Values are decimal NOK, INCLUDING applicable VAT. taxAmount is informational/included,
not added twice. Do not return catalogue discountAmount as another payable subtraction;
use 0 for that field on this net offer preview. Historical savings shown separately.
Frontend verifies the binding and payable arithmetic and fails closed on mismatch.
Menu catalogue price changes after quote issuance must not overwrite negotiated price.

placeClientOrder must atomically recheck EVERYTHING from preview, lock quote/revision,
resolve exact selected items/options/add-ons, create/reuse one unpaid order per accepted
quote, and apply the agreed price. Do not trust submitted price or snapshot JSON.
Date/time/personCount/postcode/items/options/add-ons mismatch must reject the offer.
UI removes the binding and recalculates ordinary price when those details change.
Expiry/revision/suspension must STOP payment, not silently charge normal pricing.

Idempotent unpaid order: repeated placement/retry must reuse the existing unpaid order
and session rather than duplicating orders or consuming the offer twice. Return orderId
on subsequent acceptance so frontend can continue directly to /payment/:orderId.
Do not mark the offer ORDERED/consumed until the payment success/authorization policy
is confirmed server-side. Payment failure leaves ACCEPTED until its original expiry.

createDinteroCheckoutSession (existing) MUST also validate offer ownership/revision/
expiry on every session creation/retry. Do not change its operation name or response.
Cancel/revoke existing Dintero sessions when an offer is revised/declined/expires.
Reject stale authorizations atomically and release/refund them according to provider
capabilities; a client timer or polling alone cannot prevent a payment race.
Validate again in payment webhook processing. Dedupe provider events and consumption.

New offerPaymentGuard(orderId) returns requiresOfferValidation, valid, quoteRevision,
expiresAt, reasonCode. Authorize the order owner. For ordinary orders return
requiresOfferValidation=false. For pending offer orders fail closed if invalid.
Frontend checks before embedding, before retry, every 5 seconds and on tab focus.
Known new offer orders are checked immediately. Once this endpoint is deployed,
set customer VITE_OFFERS_BACKEND_READY=true so cross-device/legacy payment routes
also always consult the guard. Server session/webhook validation is mandatory regardless
of this frontend rollout flag. A browser storage marker is NOT an authorization mechanism.
Paid orders remain accessible after their former offer deadline.

## 5. Orders, modifications, refunds and commission

orderOfferSummaries(orderIds) returns only authorized requested IDs with actual offer
metadata; omit normal orders. Fields: orderId, requestId, quoteRevision,
pricePerPerson, personCount, amountPaid, currency. Frontend batches visible badge reads.
No guessed IDs, no cross-vendor metadata. Vendor/customer orders show "Offer"/"Tilbud".
Persist the offer reference and financial snapshot on order + invoice + payment ledger.
Use normal preparation/delivery lifecycle after payment. Do not auto-accept vendor
fulfilment by treating customer offer acceptance as order fulfilment acceptance.

Existing guest-count modification APIs MUST route offer orders through vendor approval;
never automatically reprice/update a paid order. Return current/requested snapshots,
original offer revision and authoritative additional/refundable amount. Existing frontend
modification approval screens remain in use. Handle partial payments/refunds atomically.
Refund based on actual negotiated amount paid, including correct VAT/allocated charges.
12% commission is computed from the amount actually paid, not the catalogue value.
Record the commission base and use decimal arithmetic; agree existing tax/delivery/tip
allocation rules with the platform owner before changing settlement accounting.
Never implement commission or refunds as browser-side calculations.

## 6. Notifications, reminders and contact protection

Transactional outbox / scheduled jobs:
- Creation -> vendor email + targeted dashboard notification linking /offers/{id}.
- New quote/revision/message -> recipient email + targeted notification.
  Customer link /account/my-offers/{id}; vendor link /offers/{id}.
- No quote within 24h -> one vendor reminder.
- No quote within 72h -> close request; notify customer, suggest other vendors.
  Do not extend the initial reply deadline merely because someone sent a message.
- Accepted/unpaid -> one reminder before quote.expiresAt; e.g. 1 hour before expiry
  (for deadlines shorter than 1h choose a safe earlier relative interval).
- Expiry -> transition EXPIRED, cancel unpaid sessions, release open-request quota.
- Menu deleted/unpublished or vendor suspended -> close all open requests and sessions.
Run workers safely under retries/concurrency, using dedupe keys per event/recipient.
Email/in-app language follows recipient locale (English/Norwegian Bokmål).
Notifications must follow the existing tenant isolation fix: never audience-wide broadcast
private request/order content, including admin alerts and push payloads.

Server MUST detect and redact phone/email/links from every message (including initial
request and quote message) BEFORE storing public thread content, email, notifications
or logs. Normalize Unicode/obfuscation, detect spaced numbers, alternate URL schemes,
HTML/link text and domains. Strip unsafe markup. Client regex is only a warning and
last-resort display guard, not security enforcement. Never return original contact text
in customer/vendor responses. messages.moderated=true if sanitized. Notify admins in a
restricted moderation event with a safe request link. If retaining raw text for review,
store it in a separately protected admin-only audit store with access/retention policy.
Administrative failure must not expose raw text or prevent safe redaction.

## 7. Error codes in GraphQL extensions.code

AUTH_REQUIRED / PERMISSION_DENIED / OFFER_NOT_FOUND
OFFER_LIMIT_REACHED / VENDOR_OFFER_LIMIT_REACHED
OFFER_REVISION_CONFLICT / OFFER_EXPIRED / OFFER_UNAVAILABLE / OFFER_PRICE_INVALID
OFFER_DETAILS_CHANGED / OFFER_PAYMENT_PENDING / OFFER_ALREADY_ORDERED
OFFER_VALIDATION_FAILED / IDEMPOTENCY_KEY_REUSED / RATE_LIMITED
Include safe field validation details. Never include private customer/vendor data,
raw rejected contact text, SQL, credentials, internal traces or payment secrets.

## 8. Acceptance evidence required before go-live

Provide operation documents confirmed against deployed schema, migration names,
job schedules, sanitized request/response examples and English/Norwegian messages.
Test two customers/two vendors + admin, including list/count/filter/page/id-guessing,
account switch, phone/email/link redaction, notification recipients and push.
Test request limits simultaneously, duplicate submission/lost response, stale quote
acceptance and expiry while checkout is open or Dintero iframe is active.
Test catalogue price change, deleted menu, suspended vendor, failed payment/retry,
webhook races/duplicates, existing unpaid order re-entry and cross-device checkout.
Test guest-change approval, partial refund and 12% paid-value commission accounting.
Ordinary non-offer checkout and existing agreement/onboarding flows must still pass.
Do not enable production until these tests and the frontend integration tests pass.
