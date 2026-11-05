import test from "node:test";
import assert from "node:assert/strict";
import { mergeSupportReply } from "./supportReply.js";
test("a retried reply returned by the server appears only once",()=>{
 const reply={id:"123",message:"Still unresolved"};const once=mergeSupportReply([],reply);const twice=mergeSupportReply(once,reply);assert.equal(twice.length,1);assert.equal(twice,once);
});
test("a new reply preserves the existing conversation",()=>{
 const messages=[{id:"1",message:"Original"}];assert.deepEqual(mergeSupportReply(messages,{id:"2",message:"Reply"}).map(item=>item.id),["1","2"]);assert.equal(mergeSupportReply(messages,null),messages);
});
