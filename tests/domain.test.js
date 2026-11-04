import test from 'node:test';import assert from 'node:assert/strict';import {escapeHtml,validRecord,summarize,distance} from '../dist/domain.js';
test('user content is escaped',()=>assert.equal(escapeHtml('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;'));
test('rejects impossible wins and invalid numeric values',()=>{const r={attempts:10,wins:2,price:1000,rating:5};assert.ok(validRecord(r));for(const patch of [{wins:11},{attempts:0},{wins:-1},{price:NaN},{rating:6},{attempts:1.5}])assert.equal(validRecord({...r,...patch}),false)});
test('aggregates weighted rate and spending',()=>{assert.deepEqual(summarize([{attempts:10,wins:1,price:1000,rating:5},{attempts:2,wins:2,price:500,rating:3}]),{attempts:12,wins:3,rate:25,spent:11000,rating:'4.0'});assert.equal(summarize([]).rate,0)});
test('distance supports map ordering',()=>{assert.equal(distance(37,127,37,127),0);assert.ok(distance(37.566,126.978,35.179,129.075)>300)});
