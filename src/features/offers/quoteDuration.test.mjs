import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteExpiresAt } from './quoteDuration.js';
test('3, 5 and 7 day validity starts at submission and defaults to 5 days',()=>{
 const now=Date.parse('2026-11-25T10:10:00Z');
 for(const days of [3,5,7])assert.equal(Date.parse(quoteExpiresAt(days,now))-now,days*86400000);
 assert.equal(quoteExpiresAt(undefined,now),quoteExpiresAt(5,now));
 for(const days of [0,-1,4,30,'bad'])assert.throws(()=>quoteExpiresAt(days,now));
});
