import test from "node:test";
import assert from "node:assert/strict";
import { isSupportTicketClosed, assertSupportReplyAllowed } from "./supportTicketPolicy.js";
test("closed threads reject replies and remain read-only",()=>{for(const status of ["CLOSED","closed"," CLOSED "]){assert.equal(isSupportTicketClosed({status}),true);assert.throws(()=>assertSupportReplyAllowed({status}),error=>error.code==="TICKET_CLOSED");}});
test("open, in-progress and resolved threads preserve existing reply behavior",()=>{for(const status of ["OPEN","IN_PROGRESS","RESOLVED"]){assert.equal(isSupportTicketClosed({status}),false);assert.doesNotThrow(()=>assertSupportReplyAllowed({status}));}});
