import test from 'node:test';
import assert from 'node:assert/strict';
import { requestedPriceQuote, suggestedQuoteExpiry } from './requestedPriceQuote.js';
const now=Date.parse('2026-11-25T10:00:00Z');
const request={status:'WAITING_FOR_VENDOR',permissions:{canQuote:true},normalPricePerPerson:'700',targetPricePerPerson:'500'};
test('accepting target builds a quote at exactly the requested price',()=>{
 assert.deepEqual(requestedPriceQuote(request,'2026-11-26T10:00:00Z',now),{pricePerPerson:'500',expiresAt:'2026-11-26T10:00:00.000Z',message:null});
 assert.equal(Date.parse(suggestedQuoteExpiry(now)),now+5*86400000);
});
test('closed, unauthorized, invalid-price and expired quote actions are rejected',()=>{
 const expiry='2026-11-26T10:00:00Z';
 for(const patch of [{status:'DECLINED'},{status:'ACCEPTED'},{permissions:{canQuote:false}},{targetPricePerPerson:null},{targetPricePerPerson:'0'},{targetPricePerPerson:'700'}])assert.equal(requestedPriceQuote({...request,...patch},expiry,now),null);
 assert.equal(requestedPriceQuote(request,'2026-11-24T10:00:00Z',now),null);
 assert.equal(requestedPriceQuote(request,'bad',now),null);
});
