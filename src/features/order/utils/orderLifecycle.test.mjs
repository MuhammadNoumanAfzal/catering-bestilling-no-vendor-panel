import test from "node:test";
import assert from "node:assert/strict";
import { persistVendorOrderStatus, vendorNextStage } from "./orderLifecycle.js";
test("Accept persists confirmation then preparation automatically",async()=>{
 const statuses=[];const result=await persistVendorOrderStatus(async input=>{statuses.push(input.status);return {instance:{id:input.id,status:input.status}};},{id:"1",status:"CONFIRMED",note:""});
 assert.deepEqual(statuses,["ACCEPTED","PREPARING"]);assert.equal(result.instance.status,"PREPARING");
});
test("does not repeat preparation when the backend already does it",async()=>{
 let calls=0;await persistVendorOrderStatus(async()=>{calls++;return {instance:{status:"PREPARING"}};},{id:"1",status:"CONFIRMED"});assert.equal(calls,1);
});
test("failed acceptance never starts preparing",async()=>{
 let calls=0;await assert.rejects(persistVendorOrderStatus(async()=>{calls++;throw Error("Denied");},{status:"CONFIRMED"}),/Denied/);assert.equal(calls,1);
});
test("partial acceptance reports the persisted state accurately",async()=>{
 await assert.rejects(persistVendorOrderStatus(async input=>{if(input.status==="PREPARING")throw Error("Denied");return {instance:{status:"CONFIRMED"}};},{status:"CONFIRMED"}),error=>error.acceptanceSaved===true && /accepted/.test(error.message));
});
test("next vendor steps are Ready then Delivered, with no manual preparing stage",()=>{
 for(const status of ["Accepted","Preparing","Modified"])assert.equal(vendorNextStage(status),"Ready");
 assert.equal(vendorNextStage("Ready"),"Delivered");assert.equal(vendorNextStage("Delivered"),null);
});
test("ready and completion updates are persisted once",async()=>{
 for(const status of ["READY","COMPLETED"]) {let calls=0;await persistVendorOrderStatus(async input=>{calls++;return input;},{status});assert.equal(calls,1);}
});

test("recommended mutation response triggers preparing without a second acceptance", async()=>{
 const calls=[];const result=await persistVendorOrderStatus(async input=>{calls.push(input);return {order:{id:input.id,status:input.status==="ACCEPTED"?"CONFIRMED":"PREPARING",acceptedAt:"2026-11-04T18:00:00Z"}};},{id:"order",status:"ACCEPTED",note:"Thank you"});
 assert.deepEqual(calls.map(call=>call.status),["ACCEPTED","PREPARING"]);assert.ok(calls.every(call=>call.note==="Thank you"));assert.equal(result.order.status,"PREPARING");
});
test("existing fulfillment preparation does not repeat the status mutation",async()=>{
 let calls=0;await persistVendorOrderStatus(async()=>{calls++;return {order:{status:"CONFIRMED",fulfillmentStatus:"PREPARING"}};},{status:"ACCEPTED"});assert.equal(calls,1);
});
