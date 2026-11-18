import test from 'node:test';
import assert from 'node:assert/strict';
import { loginReturnPath } from './loginReturnPath.js';
const origin='https://admin.gocatering.no';
test('email destinations retain vendor/order paths, queries and anchors after login',()=>{
 assert.equal(loginReturnPath({pathname:'/vendors/12',search:'?source=email',hash:'#admin-actions'},'/dashboard',origin),'/vendors/12?source=email#admin-actions');
 assert.equal(loginReturnPath('/orders/43?source=email','/dashboard',origin),'/orders/43?source=email');
 assert.equal(loginReturnPath({pathname:'/offers/abc'},'/dashboard',origin),'/offers/abc');
});
test('unsafe email return paths and authentication loops use the safe default',()=>{
 for(const from of ['https://evil.example/x','//evil.example/x','javascript:alert(1)','/auth/login','/auth/forgot-password',null])assert.equal(loginReturnPath(from,'/dashboard',origin),'/dashboard');
});
