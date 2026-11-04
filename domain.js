/** @param {string} value */
export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c)); }
/** @param {{attempts:number,wins:number,price:number,rating:number}} r */
export function validRecord(r) { return Number.isInteger(r.attempts) && r.attempts > 0 && r.attempts <= 10000 && Number.isInteger(r.wins) && r.wins >= 0 && r.wins <= r.attempts && Number.isInteger(r.price) && r.price >= 0 && r.price <= 100000 && Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5; }
/** @param {Array<{attempts:number,wins:number,price:number,rating:number}>} records */
export function summarize(records) { const attempts=records.reduce((s,r)=>s+r.attempts,0),wins=records.reduce((s,r)=>s+r.wins,0); return {attempts,wins,rate:attempts?Math.round(wins/attempts*100):0,spent:records.reduce((s,r)=>s+r.attempts*r.price,0),rating:records.length?(records.reduce((s,r)=>s+r.rating,0)/records.length).toFixed(1):null}; }
/** @param {number} a @param {number} b @param {number} c @param {number} d */
export function distance(a,b,c,d) { const rad=Math.PI/180; const h=Math.sin((c-a)*rad/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin((d-b)*rad/2)**2;return 6371*2*Math.asin(Math.min(1,Math.sqrt(h))); }
