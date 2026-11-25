import test from 'node:test';
import assert from 'node:assert/strict';
test('missing backend features cannot enable a fake withdrawal or events query',async()=>{
 const {getOfferCapabilities}=await import('./offerCapabilities.js?missing');
 let reads=0;const send=async()=>{reads++;return {__schema:{mutationType:{fields:[]}}};};
 assert.deepEqual(await getOfferCapabilities(send),{events:false,withdraw:false,quoteTiming:false});
 await getOfferCapabilities(send);assert.equal(reads,1);
});
test('new backend contract enables events and withdrawal only when all fields exist',async()=>{
 const {getOfferCapabilities}=await import('./offerCapabilities.js?complete');
 const fields=names=>names.map(name=>({name}));
 const send=async()=>({__schema:{mutationType:{fields:fields(['withdrawMenuOffer'])}},quote:{fields:fields(['startsAt','isActive','isScheduled'])},request:{fields:fields(['events'])},event:{fields:fields(['id','type','side','text','createdAt','pricePerPerson','status','quoteRevision'])},permissions:{fields:fields(['canWithdraw'])},withdrawal:{inputFields:fields(['requestId','expectedRevision','quoteRevision','idempotencyKey'])},statuses:{enumValues:fields(['WITHDRAWN'])}});
 assert.deepEqual(await getOfferCapabilities(send),{events:true,withdraw:true,quoteTiming:true});
});
