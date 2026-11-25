import test from 'node:test';
import assert from 'node:assert/strict';
import { offerDetailPath, offerIdFromSlug } from './offerNavigation.js';
import { offerCheckoutAction } from './offerCheckoutAction.js';
test('named URLs keep numeric IDs at the end and preserve opaque IDs',()=>{
 assert.equal(offerDetailPath('/my-offers',{id:'7',menuName:'Jordb\u00e6r & Lime terte'}),'/my-offers/jordbaer-lime-terte-7');
 assert.equal(offerDetailPath('/offers',{id:'sample-request',menuName:'Tapas'}),'/offers/tapas--sample-request');
 assert.equal(offerIdFromSlug('jordbaer-lime-terte-7'),'7');
 assert.equal(offerIdFromSlug('tapas--sample-request'),'sample-request');
 assert.equal(offerIdFromSlug('7'),'7');
 assert.equal(offerIdFromSlug('sample-request'),'sample-request');
});
test('checkout actions are exclusive even when accepted permission stays true',()=>{
 const request={status:'OFFERED',permissions:{canAccept:true}};
 assert.equal(offerCheckoutAction(request,true),'accept');
 assert.equal(offerCheckoutAction({...request,status:'ACCEPTED'},true),'continue');
 assert.equal(offerCheckoutAction({...request,status:'DECLINED'},true),null);
 assert.equal(offerCheckoutAction({...request,status:'WITHDRAWN'},true),null);
 assert.equal(offerCheckoutAction(request,false),null);
 assert.equal(offerCheckoutAction({...request,orderId:'order1'},true),null);
});
