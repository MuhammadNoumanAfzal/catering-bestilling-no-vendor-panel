import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('');globalThis.window=dom.window;globalThis.document=dom.window.document;
const {descriptionContent,descriptionText}=await import('./descriptionFormatting.js');
test('keeps menu formatting including headings and nested lists',()=>{
 const html='<h2>Lunch</h2><p><strong>Fresh</strong> <em>daily</em> <u>menu</u></p><ul><li>Salad<ol><li>Bread</li></ol></li></ul>';
 assert.equal(descriptionContent(html),html);
});
test('removes executable HTML, handlers, styling and unsafe links',()=>{
 const safe=descriptionContent('<p onclick="alert(1)" style="color:red">Lunch<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">more</a><iframe src="https://example.com"></iframe></p>');
 assert.equal(safe,'<p>Lunchmore</p>');
});
test('old plain text retains line breaks and literal angle brackets',()=>{
 assert.equal(descriptionContent('Fresh & tasty\nServes < 10'),'Fresh &amp; tasty<br>Serves &lt; 10');
 assert.equal(descriptionContent('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
});
test('summary text contains words without HTML or encoded entities',()=>{
 assert.equal(descriptionText('<p>Fish &amp; chips</p><ul><li>Salad</li><li>Bread</li></ul>'),'Fish & chips Salad Bread');
});
test('embedded SVG, frames and form controls cannot add active content',()=>{
 assert.equal(descriptionContent('<p>Menu<svg onload="alert(1)"><circle /></svg><iframe src="https://example.com"></iframe><input autofocus onfocus="alert(1)"></p>'),'<p>Menu</p>');
});
