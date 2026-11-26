import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteExpiresAt } from './quoteDuration.js';
test('preset and custom validity starts at submission and defaults to 5 days',()=>{
 const now=Date.parse('2026-11-25T10:10:00Z');
 for(const days of [1,2,3,4,5,7,14,30])assert.equal(Date.parse(quoteExpiresAt(days,now))-now,days*86400000);
 assert.equal(quoteExpiresAt(undefined,now),quoteExpiresAt(5,now));
 for(const days of [0,-1,31,1.5,'','bad','1e1',' 5',Infinity])assert.throws(()=>quoteExpiresAt(days,now));
});
