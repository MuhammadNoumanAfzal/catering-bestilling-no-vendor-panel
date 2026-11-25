import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeOfferUpdate, isConversationClosed } from './offerLiveState.js';
test('confirmed decline cannot be reopened by a late pre-decline response',()=>{
 const closed={id:'6',status:'DECLINED',permissions:{canMessage:false}};
 for(const status of ['WAITING_FOR_VENDOR','OFFERED','ACCEPTED'])assert.equal(mergeOfferUpdate(closed,{id:'6',status,permissions:{canMessage:true}}),closed);
 assert.equal(isConversationClosed(closed),true);
});
test('remote decline closes an open request and other requests remain independent',()=>{
 const open={id:'6',status:'OFFERED'};
 const declined={id:'6',status:'DECLINED'};
 assert.equal(mergeOfferUpdate(open,declined),declined);
 assert.equal(isConversationClosed(mergeOfferUpdate(open,declined)),true);
 const other={id:'7',status:'OFFERED'};
 assert.equal(mergeOfferUpdate(declined,other),other);
 assert.equal(isConversationClosed(other),false);
});

test('withdrawn quote cannot be revived by a delayed old quote, but a new quote may replace it',()=>{
 const withdrawn={id:'6',status:'WITHDRAWN',quote:{revision:'q1'}};
 assert.equal(mergeOfferUpdate(withdrawn,{id:'6',status:'OFFERED',quote:{revision:'q1'}}),withdrawn);
 const newer={id:'6',status:'OFFERED',quote:{revision:'q2'}};
 assert.equal(mergeOfferUpdate(withdrawn,newer),newer);
 const accepted={id:'6',status:'ACCEPTED',quote:{revision:'q2'}};
 assert.equal(mergeOfferUpdate(accepted,newer),accepted);
});
