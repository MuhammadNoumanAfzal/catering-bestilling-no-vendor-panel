import { requestOfferGraphql, isVendorApp } from './offerBridge.js';
export const offersEnabled = import.meta.env.VITE_OFFERS_ENABLED !== 'false';
export const offerFields = `id revision status createdAt updatedAt responseDueAt deliveryDate deliveryTime personCount postalCode menuId menuName vendor { id slug name } customerDisplayName normalPricePerPerson targetPricePerPerson orderId permissions { canMessage canQuote canAccept canDecline } quote { revision pricePerPerson expiresAt } messages { id side text createdAt moderated } checkoutSnapshot { vendor { id slug name } items { id productId name unitPrice catalogueUnitPrice pricingType quantity personCount minimumGuests parentMenuItemId addOnKey addOnType selectedOptions selectedAddons { productId name quantity unitPrice } isAddOn } }`;
export const documents = {
 list: `query OfferRequests($status: OfferRequestStatus, $page: Int!) { ${isVendorApp ? 'vendorOfferRequests' : 'myOfferRequests'}(status:$status,page:$page,pageSize:20) { totalCount pageCount items { ${offerFields} } } }`,
 detail: `query OfferRequest($id: ID!) { ${isVendorApp ? 'vendorOfferRequest' : 'myOfferRequest'}(id:$id) { ${offerFields} } }`,
 create: `mutation RequestMenuOffer($input: RequestMenuOfferInput!) { requestMenuOffer(input:$input) { request { ${offerFields} } } }`,
 message: `mutation SendOfferMessage($input: SendOfferMessageInput!) { sendOfferMessage(input:$input) { request { ${offerFields} } } }`,
 quote: `mutation SendMenuOffer($input: SendMenuOfferInput!) { sendMenuOffer(input:$input) { request { ${offerFields} } } }`,
 accept: `mutation AcceptMenuOffer($input: AcceptMenuOfferInput!) { acceptMenuOffer(input:$input) { request { ${offerFields} } } }`,
 decline: `mutation DeclineMenuOffer($input: DeclineMenuOfferInput!) { declineMenuOffer(input:$input) { request { ${offerFields} } } }`,
};
const roots = { list:isVendorApp?'vendorOfferRequests':'myOfferRequests', detail:isVendorApp?'vendorOfferRequest':'myOfferRequest',create:'requestMenuOffer',message:'sendOfferMessage',quote:'sendMenuOffer',accept:'acceptMenuOffer',decline:'declineMenuOffer' };
export async function offerRequest(operation, variables={}) {
 if (!offersEnabled) throw new Error('Offers disabled');
 const data=await requestOfferGraphql(documents[operation], variables);
 const result=data?.[roots[operation]];
 if (!result || (['create','message','quote','accept','decline'].includes(operation) && !result.request?.id)) throw new Error('Offer response unavailable');
 return result.request || result;
}
export function newIdempotencyKey() { return crypto.randomUUID(); }
