import assert from 'node:assert/strict';
import test from 'node:test';
import { moneyToOre, validQuote, redactContact, hasContactDetails, isOfferCurrent, acceptedOfferCart, offerMatchesCheckout, restoreCatalogueSummary, verifyOfferPreview } from './offerModel.js';
const request=()=>({id:'r1',revision:'3',status:'ACCEPTED',deliveryDate:'2099-12-10',deliveryTime:'12:00',personCount:100,postalCode:'0123',quote:{revision:'q2',pricePerPerson:'79.00',expiresAt:'2099-12-09T20:00:00Z'},checkoutSnapshot:{vendor:{id:'v1',slug:'vendor'},items:[{id:'line',productId:'m1',name:'Menu',unitPrice:'79.00',catalogueUnitPrice:'89.00',pricingType:'per-person',quantity:1}]}});
test('quotes reject free, equal, higher, malformed and fractional-ore prices',()=>{
 assert.equal(moneyToOre('79,95'),7995);
 for(const price of ['0','-1','89','90','1e2','7.999','NaN'])assert.equal(validQuote(price,'89'),false);
 assert.equal(validQuote('79.95','89'),true);
});
test('messages conceal phone, email and web addresses but preserve guest counts and postcodes',()=>{
 for(const content of ['Call +47 912 34 567','Email me at test@example.no','https://example.no/x','www.example.no','example.no']){assert.ok(hasContactDetails(content));assert.ok(redactContact(content).includes('[hidden]'));}
 assert.equal(redactContact('100 guests, postcode 0123. Budget 79 kr.'),'100 guests, postcode 0123. Budget 79 kr.');
});
test('quotes require a live server revision, accepted status and a future deadline',()=>{
 assert.ok(isOfferCurrent(request()));
 assert.equal(isOfferCurrent({...request(),status:'CLOSED'}),false);
 assert.equal(isOfferCurrent({...request(),quote:{revision:'q',expiresAt:'bad'}}),false);
 assert.equal(isOfferCurrent({...request(),quote:{revision:'q',expiresAt:'2000-01-01'}}),false);
});
test('accepted snapshots bind the exact vendor, menu, guests and delivery details',()=>{
 const cart=acceptedOfferCart(request()),b=cart.orderSummary.offer;
 const form={date:'2099-12-10',time:'12:00',deliveryPostalCode:'0123'};
 assert.equal(offerMatchesCheckout(b,cart,form),true);
 for(const change of [{date:'2099-12-11'},{time:'12:01'},{deliveryPostalCode:'9999'}])assert.equal(offerMatchesCheckout(b,cart,{...form,...change}),false);
 assert.equal(offerMatchesCheckout(b,{...cart,vendor:{id:'v2'}},form),false);
 assert.equal(offerMatchesCheckout(b,{...cart,orderSummary:{...cart.orderSummary,personCount:101}},form),false);
 assert.equal(offerMatchesCheckout(b,{...cart,orderSummary:{...cart.orderSummary,items:[{...cart.orderSummary.items[0],quantity:2}]}},form),false);
});
test('removing an offer restores catalogue amounts and clears derived pricing',()=>{
 const cart=acceptedOfferCart(request());const normal=restoreCatalogueSummary(cart.orderSummary);
 assert.equal(normal.items[0].unitPrice,'89.00');assert.equal(normal.offer,null);assert.equal(normal.pricing,null);assert.equal(normal.offerRemoved,true);
});
test('malformed snapshots cannot introduce arbitrary negotiated line prices',()=>{
 const invalid=request();invalid.checkoutSnapshot.items[0].unitPrice='0';assert.throws(()=>acceptedOfferCart(invalid));
 const missing=request();delete missing.checkoutSnapshot.items[0].catalogueUnitPrice;assert.throws(()=>acceptedOfferCart(missing));
});
test('checkout verifies quote revision, food amount and full payable total',()=>{
 const offer=acceptedOfferCart(request()).orderSummary.offer;
 const preview={offerBinding:{requestId:'r1',quoteRevision:'q2',foodTotal:'7900'},pricing:{addOnsTotal:'50',deliveryFee:'100',tipAmount:'0',serviceFee:'0',grandTotal:'8050'}};
 assert.equal(verifyOfferPreview(preview,offer),true);
 assert.equal(verifyOfferPreview({...preview,offerBinding:{...preview.offerBinding,quoteRevision:'q3'}},offer),false);
 assert.equal(verifyOfferPreview({...preview,offerBinding:{...preview.offerBinding,foodTotal:'8900'}},offer),false);
 assert.equal(verifyOfferPreview({...preview,pricing:{...preview.pricing,grandTotal:'1'}},offer),false);
});
