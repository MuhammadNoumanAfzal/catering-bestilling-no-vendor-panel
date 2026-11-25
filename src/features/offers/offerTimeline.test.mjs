import test from 'node:test';
import assert from 'node:assert/strict';
import { offerTimeline } from './offerTimeline.js';
import { dateTime } from './offerFormat.js';
test('timeline uses persisted event IDs, preserves distinct quotes and sorts both sides identically',()=>{
 const event={id:'e1',type:'OFFER_SENT',createdAt:'2027-01-01T10:01:00Z',pricePerPerson:'500'};
 const request={messages:[{id:'m1',text:'Hi',createdAt:'2027-01-01T10:00:00Z'}],events:[event,{id:'e2',type:'OFFER_CHANGED',createdAt:'2027-01-01T10:02:00Z',pricePerPerson:'450'},event]};
 const items=offerTimeline(request);
 assert.deepEqual(items.map(i=>i.key),['message:m1','event:e1','event:e2']);
 assert.equal(items[1].pricePerPerson,'500');assert.equal(items[2].pricePerPerson,'450');
 assert.equal(offerTimeline({messages:[]}).length,0);
});
test('Norway time preserves an explicit instant and handles summer and winter offsets',()=>{
 const text=en=>en;
 assert.equal(dateTime('2027-01-01T16:30:00Z',text),'Fri 1 Jan 2027, 17:30 (Norway time)');
 assert.match(dateTime('2027-07-01T08:10:00Z',text),/10:10 \(Norway time\)/);
 assert.equal(dateTime('2027-01-01T16:30:00',text),dateTime('2027-01-01T16:30:00Z',text));
});
