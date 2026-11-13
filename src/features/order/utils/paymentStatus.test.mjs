import test from "node:test";
import assert from "node:assert/strict";
import { isCustomerPaymentCleared, isCustomerPaymentReserved } from "./paymentStatus.js";
test("green paid badge requires a persisted PAID customer payment status",()=>{
 assert.equal(isCustomerPaymentCleared({customerPaymentStatus:"PAID"}),true);
 for(const status of ["PENDING","PARTIALLY_PAID","REJECTED","UNPAID",null])assert.equal(isCustomerPaymentCleared({customerPaymentStatus:status}),false);
});
test("order delivery and vendor payout do not imply customer payment clearance",()=>{
 assert.equal(isCustomerPaymentCleared({status:"COMPLETED",payoutStatus:"PAID",paidAmount:"100"}),false);
});

test("authorization is reserved, not cleared or settled",()=>{assert.equal(isCustomerPaymentReserved({customerPaymentStatus:"AUTHORIZED"}),true);assert.equal(isCustomerPaymentCleared({customerPaymentStatus:"AUTHORIZED"}),false);assert.equal(isCustomerPaymentReserved({customerPaymentStatus:"PAID"}),false);});
