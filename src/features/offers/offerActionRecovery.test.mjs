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


test('decline closes on acknowledgement before a slow detail refresh', async () => {
 let closed=false;
 let finish;
 const waiting=new Promise(resolve=>{finish=resolve;});
 const action=performOfferAction({operation:'decline',before:{id:'6',revision:'1'},send:async()=>({id:'6'}),onConfirmed:()=>{closed=true;},load:()=>waiting});
 await Promise.resolve();
 assert.equal(closed,true);
 finish({id:'6',revision:'2',status:'DECLINED'});
 assert.equal((await action).status,'DECLINED');
});

test('failed decline never closes the conversation without confirmation', async () => {
 let closed=false;
 await assert.rejects(performOfferAction({operation:'decline',before:{id:'6',revision:'1'},send:async()=>{throw Error('Denied');},onConfirmed:()=>{closed=true;},load:async()=>({id:'6',revision:'1',status:'WAITING_FOR_VENDOR'})}));
 assert.equal(closed,false);
});

test('stale details after decline cannot reopen a confirmed closed conversation', async () => {
 let closed=false;
 await assert.rejects(performOfferAction({operation:'decline',before:{id:'6',revision:'1'},send:async()=>({id:'6'}),onConfirmed:()=>{closed=true;},load:async()=>({id:'6',revision:'1',status:'WAITING_FOR_VENDOR'})}),error=>error.actionConfirmed===true);
 assert.equal(closed,true);
});

test('a lost quote acknowledgement recovers only the exact new quote without another write',async()=>{
 const expected={pricePerPerson:'500',expiresAt:'2027-01-07T10:00:00Z'};
 const before={id:'6',revision:'1',status:'WAITING_FOR_VENDOR'};
 const latest={...before,status:'OFFERED',revision:'2',quote:{revision:'q2',...expected}};
 let writes=0;
 const send=async()=>{writes++;throw Error('response lost');};
 assert.deepEqual(await performOfferAction({operation:'quote',before,expected,send,load:async()=>latest}),latest);
 assert.equal(writes,1);
 await assert.rejects(performOfferAction({operation:'quote',before,expected,send,load:async()=>({...latest,quote:{...latest.quote,pricePerPerson:'501'}})}));
});
test('withdrawal is confirmed only by its own changed request revision',async()=>{
 const before={id:'6',revision:'1',status:'OFFERED'};
 const latest={...before,revision:'2',status:'WITHDRAWN'};
 assert.deepEqual(await performOfferAction({operation:'withdraw',before,send:async()=>{throw Error('response lost');},load:async()=>latest}),latest);
 await assert.rejects(performOfferAction({operation:'withdraw',before,send:async()=>{throw Error('response lost');},load:async()=>({...latest,id:'other'})}));
});

test('lost message response recovers only a new matching message from the expected side',async()=>{
 const before={id:'6',revision:'1',messages:[{id:'old',side:'CUSTOMER',text:'Hello'}]};
 const message={id:'new',side:'CUSTOMER',text:'Hello'};
 const latest={...before,revision:'2',messages:[...before.messages,message]};
 const send=async()=>{throw Error('response lost');};
 assert.deepEqual(await performOfferAction({operation:'message',before,expected:{message:'Hello'},side:'CUSTOMER',send,load:async()=>latest}),latest);
 await assert.rejects(performOfferAction({operation:'message',before,expected:{message:'Hello'},side:'CUSTOMER',send,load:async()=>({...latest,messages:before.messages})}));
 await assert.rejects(performOfferAction({operation:'message',before,expected:{message:'Hello'},side:'VENDOR',send,load:async()=>latest}));
});
