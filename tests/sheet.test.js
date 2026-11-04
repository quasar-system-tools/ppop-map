import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {escapeHtml,validRecord,summarize,distance} from '../dist/domain.js';

async function setup(t) {
  // Execute the real app against a DOM and a map adapter; no network or user data.
  const dom = new JSDOM(fs.readFileSync('dist/index.html','utf8'), {
    url:'https://example.com/ppop-map/',runScripts:'outside-only',pretendToBeVisual:true
  });
  t.after(()=>dom.window.close());
  const w=dom.window, events={}, markerEvents=[];
  const map={setView(){return this},getZoom(){return 16},panBy(){return this},getCenter(){return {lat:37.55,lng:126.92}},getBounds(){return {contains:()=>true}},on(name,fn){events[name]=fn;return this},removeLayer(){},zoomIn(){},zoomOut(){}};
  w.L={map:()=>map,tileLayer:()=>({addTo(){return this},on(){return this}}),divIcon:x=>x,marker:()=>({addTo(){return this},on(name,fn){if(name==='click')markerEvents.push(fn);return this}})};
  const stores=[{id:'one',name:'테스트 인형뽑기',address:'서울특별시 마포구',lat:37.55,lng:126.92,candidate:true,source:'localdata'},{id:'two',name:'두 번째 뽑기방',address:'서울특별시 마포구',lat:37.56,lng:126.93,candidate:true,source:'localdata'}];
  w.fetch=async url=>({ok:true,json:async()=>url.includes('stores')?stores:{candidates:2}});
  Object.assign(w,{esc:escapeHtml,validRecord,summarize,distance});
  w.requestAnimationFrame=fn=>{fn();return 0};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
  w.eval(fs.readFileSync('dist/app.js','utf8').replace(/^import .*?;\n/,''));
  await new Promise(resolve=>setImmediate(resolve));
  return {w,events,markerEvents,$:s=>w.document.querySelector(s)};
}
test('marker opens a non-modal sheet and keeps map usable; close restores list',async t=>{
  const {$,w,markerEvents,events}=await setup(t);
  markerEvents[0]();
  assert.equal($('#detail-sheet').hidden,false);
  assert.equal($('#detail-sheet').tagName,'SECTION');
  assert.equal($('#detail-title').textContent,'테스트 인형뽑기');
  assert.ok(w.document.body.classList.contains('detail-open'));
  assert.equal(w.document.querySelector('dialog[open]'),null);
  events.click();
  assert.ok(!w.document.body.classList.contains('detail-open'));
  assert.equal($('#detail-sheet').classList.contains('sheet-open'),false);
});
test('expand, save and switch stores preserve the intended sheet state',async t=>{
  const {$,w}=await setup(t);
  $('[data-store="one"]').click();
  $('#sheet-toggle').click();
  assert.equal($('#sheet-toggle').getAttribute('aria-expanded'),'true');
  $('#detail-header [data-save]').click();
  assert.equal($('#sheet-toggle').getAttribute('aria-expanded'),'true');
  assert.ok($('#detail-header').textContent.includes('저장됨'));
  $('[data-store="two"]').click();
  assert.equal($('#detail-title').textContent,'두 번째 뽑기방');
  assert.equal($('#sheet-toggle').getAttribute('aria-expanded'),'false');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
  assert.equal($('#detail-sheet').classList.contains('sheet-open'),false);
});
test('Escape in a record dialog does not close the underlying store sheet',async t=>{
  const {$,w}=await setup(t);
  $('[data-store="one"]').click();
  $('#write-record').click();
  assert.ok($('#form-dialog').open);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
  assert.ok($('#detail-sheet').classList.contains('sheet-open'));
});
test('dragging the handle expands, collapses, then dismisses the sheet',async t=>{
  const {$,w}=await setup(t);
  $('[data-store="one"]').click();
  const grip=$('#sheet-grip');
  grip.setPointerCapture=()=>{};
  function swipe(from,to) {
    grip.dispatchEvent(new w.MouseEvent('pointerdown',{clientY:from,bubbles:true}));
    grip.dispatchEvent(new w.MouseEvent('pointerup',{clientY:to,bubbles:true}));
    // Browsers dispatch a click after pointerup: it must not undo the swipe.
    grip.click();
  }
  swipe(200,100);
  assert.equal($('#sheet-toggle').getAttribute('aria-expanded'),'true');
  swipe(100,200);
  assert.equal($('#sheet-toggle').getAttribute('aria-expanded'),'false');
  swipe(100,200);
  assert.ok(!w.document.body.classList.contains('detail-open'));
});
