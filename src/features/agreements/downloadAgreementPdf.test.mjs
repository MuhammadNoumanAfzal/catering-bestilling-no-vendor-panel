import test from 'node:test';import assert from 'node:assert/strict';
import {downloadAgreementPdf} from './downloadAgreementPdf.js';
test('PDF download clicks a named local file link without navigation or storage credentials',async()=>{
 const old={fetch:globalThis.fetch,document:globalThis.document,window:globalThis.window};let clicked=false,removed=false,options,link;
 try{
 globalThis.fetch=async(_url,opts)=>{options=opts;return new Response('%PDF-1.7\nfixture');};
 globalThis.document={createElement:()=>link={click(){clicked=true;},remove(){removed=true;}},body:{appendChild(){}}};
 globalThis.window={setTimeout:callback=>callback()};
 await downloadAgreementPdf('https://storage.example.test/signed','agreement.pdf');
 assert.equal(clicked,true);assert.equal(removed,true);assert.equal(link.download,'agreement.pdf');assert.match(link.href,/^blob:/);assert.equal(options.credentials,'omit');assert.equal(options.headers,undefined);
 }finally{Object.assign(globalThis,old);}
});
test('HTTP errors and non-PDF responses never trigger a file download',async()=>{
 const old=globalThis.fetch;
 try{
 globalThis.fetch=async()=>new Response('denied',{status:403});await assert.rejects(()=>downloadAgreementPdf('https://storage.example.test','x.pdf'),/could not be downloaded/);
 globalThis.fetch=async()=>new Response('<html>login</html>');await assert.rejects(()=>downloadAgreementPdf('https://storage.example.test','x.pdf'),/did not return a PDF/);
 }finally{globalThis.fetch=old;}
});
