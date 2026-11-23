import test from 'node:test';
import assert from 'node:assert/strict';
import { performOfferAction } from './offerActionRecovery.js';
const before = { id: '3', status: 'WAITING_FOR_VENDOR', revision: '1' };
const declined = { ...before, status: 'DECLINED', revision: '2' };

test('successful acknowledgement loads full details independently', async () => {
  assert.deepEqual(await performOfferAction({ operation:'decline', before, send:async()=>({id:'3'}), load:async()=>declined }), declined);
});
test('decline persisted despite a lost mutation response is reported as success', async () => {
  let writes=0;
  const result=await performOfferAction({ operation:'decline', before, send:async()=>{writes++;throw Error('response serialization failed');}, load:async()=>declined });
  assert.deepEqual(result,declined);assert.equal(writes,1);
});
test('unchanged, unrelated and already declined states do not hide failures', async () => {
  const failure=Error('Request rejected');
  for(const [initial,latest] of [[before,before],[before,{...declined,id:'other'}],[before,{...declined,revision:'1'}],[declined,declined]]) {
    await assert.rejects(performOfferAction({operation:'decline',before:initial,send:async()=>{throw failure;},load:async()=>latest}),error=>error===failure);
  }
});
test('a refresh failure after acknowledgement is distinguished from a failed action', async () => {
  await assert.rejects(performOfferAction({operation:'quote',before,send:async()=>({id:'3'}),load:async()=>{throw Error('offline');}}),error=>error.actionConfirmed===true&&error.code==='OFFER_DETAILS_REFRESH_FAILED');
});
test('a failed quote or message is never inferred from an unrelated status change', async () => {
  for(const operation of ['quote','message'])await assert.rejects(performOfferAction({operation,before,send:async()=>{throw Error('rejected');},load:async()=>declined}));
});
