import test from "node:test";
import assert from "node:assert/strict";
import { createVendorNotificationClient } from "./unifiedNotificationClient.js";
function payload(count=127) {return {myNotifications:{edges:[{node:{id:"1",isRead:false,entity:{entityType:"ORDER",entityId:"501"}}}],pageInfo:{totalCount:200,hasNextPage:true,endCursor:"next"}},myNotificationUnreadCount:{count}};}
test("vendor unread count comes from server, independent of loaded rows",async()=>{
 const api=createVendorNotificationClient(async()=>payload());assert.equal((await api.feed({first:1})).vendorFinanceNotifications.unreadCount,127);assert.equal((await api.counts()).vendorFinanceNotifications.unreadCount,127);
});
test("passes cursor, status and date filters and preserves entity routing",async()=>{
 const api=createVendorNotificationClient(async(q,v)=>{assert.deepEqual(v,{first:20,after:"cursor",filter:{status:"ARCHIVED",dateFrom:"2026-11-01T00:00:00Z",dateTo:"2026-11-04T23:59:59.999Z"}});return payload();});const result=await api.feed({after:"cursor",status:"ARCHIVED",dateFrom:"2026-11-01",dateTo:"2026-11-04"});assert.equal(result.vendorFinanceNotifications.pageInfo.endCursor,"next");assert.equal(result.vendorFinanceNotifications.edges[0].node.orderId,"501");
});
test("read, mark-all, archive and restore use persisted vendor-scoped mutations",async()=>{
 const api=createVendorNotificationClient(async(q,v)=> q.includes("markNotificationRead")?{markNotificationRead:{success:true,notification:{id:v.id,isRead:true}}}:q.includes("markAllMyNotificationsRead")?{markAllMyNotificationsRead:{success:true,updatedCount:127}}:q.includes("unarchiveNotification")?{unarchiveNotification:{success:true}}:{archiveNotification:{success:true}});
 assert.equal((await api.read("1")).notification.isRead,true);assert.equal((await api.readAll()).updatedCount,127);assert.ok((await api.archive("1")).success);assert.ok((await api.unarchive("1")).success);
});
test("bad counts and failed read mutations do not become success or zero",async()=>{
 const api=createVendorNotificationClient(async()=>payload(null));await assert.rejects(api.counts(),/Invalid notification count/);const failed=createVendorNotificationClient(async()=>({markNotificationRead:{success:false,message:"Denied"}}));await assert.rejects(failed.read("1"),/Denied/);
});
