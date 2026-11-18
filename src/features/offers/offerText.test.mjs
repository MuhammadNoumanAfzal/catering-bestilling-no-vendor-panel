import test from 'node:test';
import assert from 'node:assert/strict';
import { offerError } from './offerText.js';
test('offer errors use explicit backend English/Norwegian messages',()=>{
 const error={code:'OFFER_DETAILS_CHANGED',graphqlErrors:[{extensions:{message_en:'The guest count changed.',message_nb:'Antall gjester er endret.'}}]};
 assert.equal(offerError(error,(en)=>en),'The guest count changed.');
 assert.equal(offerError(error,(_en,nb)=>nb),'Antall gjester er endret.');
});
test('missing backend translations retain a safe localized fallback',()=>{
 const error={code:'OFFER_EXPIRED'};
 assert.equal(offerError(error,en=>en),'This offer has expired.');
 assert.ok(offerError(error,(_en,nb)=>nb).length>0);
});
