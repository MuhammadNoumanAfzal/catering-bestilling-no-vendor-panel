import test from 'node:test';
import assert from 'node:assert/strict';
import {dinteroPayoutFields} from './payoutDestination.js';
test('Dintero onboarding requires a destination, trims it and never self-verifies',()=>{
 assert.throws(()=>dinteroPayoutFields({payoutMethod:'DINTERO',dinteroAccountId:' '}));
 assert.deepEqual(dinteroPayoutFields({payoutMethod:'DINTERO',dinteroAccountId:' dest_123 ',bankDetailsVerified:true}),{dinteroAccountId:'dest_123'});
});
test('bank payout users can save without a Dintero destination',()=>assert.deepEqual(dinteroPayoutFields({payoutMethod:'BANK_TRANSFER'}),{dinteroAccountId:''}));
