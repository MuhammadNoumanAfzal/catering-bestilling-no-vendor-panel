import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteTiming } from './offerTiming.js';
const now=Date.parse('2026-11-25T10:00:00Z');
const quote={expiresAt:'2026-11-30T10:00:00Z'};
test('old quotes remain compatible; timing boundaries fail closed',()=>{
 assert.equal(quoteTiming(quote,now),'active');
 assert.equal(quoteTiming({...quote,startsAt:'2026-11-25T10:00:01Z'},now),'scheduled');
 assert.equal(quoteTiming({...quote,startsAt:'2026-11-25T10:00:00Z'},now),'active');
 assert.equal(quoteTiming({...quote,isScheduled:true},now),'scheduled');
 assert.equal(quoteTiming({...quote,isActive:false},now),'inactive');
 assert.equal(quoteTiming({...quote,startsAt:'invalid'},now),'inactive');
 assert.equal(quoteTiming({...quote,expiresAt:new Date(now).toISOString()},now),'expired');
});
