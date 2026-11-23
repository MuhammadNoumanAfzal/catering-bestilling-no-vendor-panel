import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVendorNotificationTarget } from './notificationNavigation.js';

test('offer notifications open offer requests before generic menu routes',()=>{
  assert.equal(resolveVendorNotificationTarget({rawType:'MENU_OFFER_REQUESTED',entity:{entityType:'MENU_OFFER_REQUEST',entityId:'5'}}),'/offers/5');
  assert.equal(resolveVendorNotificationTarget({rawType:'OFFER_MESSAGE'}),'/offers');
  assert.equal(resolveVendorNotificationTarget({rawType:'ORDER_UPDATE',orderId:'12'}),'/orders/12');
});
