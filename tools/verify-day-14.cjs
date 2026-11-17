const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-14.cjs')[0];
const times=['8:00','10:20','12:00','12:45','15:20','15:50'];
assert.equal(d.title,'Осака');assert.equal(d.jp,'大阪');assert.equal(d.color,'#C49A4A');
assert.equal(d.date,'понедельник, 24 мая');assert.equal(new Date(Date.UTC(2027,4,24)).getUTCDay(),1);
assert.equal(d.stops.length,3);assert.equal(d.rows.length,6);
assert.deepEqual(d.stops.map(s=>s.jp),['勝尾寺','箕面公園','箕面大滝']);
assert.deepEqual(d.stops.map(s=>s.type),['temple','nature','nature']);
assert.deepEqual(d.stops.map(s=>s.time),times.slice(1,4));
assert.deepEqual(d.rows.map(s=>s.time),times);
assert.deepEqual(d.rows.map(s=>s.cardIndex),[undefined,0,1,2,undefined,undefined]);
assert(!d.stops.some(s=>s.optional||s.duration),'No optional places or durations supplied');
assert.equal(d.rows[0].note,'💡 Вылет из ITM<br>🧳 Оставить багаж Senri-Chuo');
assert.equal(d.rows[4].note,'🧳 Вернуться за чемоданами');
assert.equal(d.rows[5].note,'💡 Вылетаем в 18:00');
assert.equal(d.rows[5].name,'✈️ Летим в Саппоро');
assert(d.beforeStops.text.includes(d.rows[0].note));
assert.equal(d.stops[0].after.text,'12:00 — 🚌 Minoh Park.');
assert.equal(d.stops[2].after.text,'15:20 — 🚇 Senri-Chuo. 🧳 Вернуться за чемоданами.<br>15:50 — ✈️ Летим в Саппоро. 💡 Вылетаем в 18:00.');
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Four photo briefs required');
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['8:00–17:00','¥500','16:30'],['Без расписания','Бесплатно','—'],['Без расписания','Бесплатно','—']
]);
for(const s of d.stops){
 assert(s.jp&&s.kana&&s.en&&s.address&&s.city&&s.type&&s.vertical);
 assert.equal(s.quick.length,3);assert(s.quick.every(t=>t.split(/\s+/).length<=15));
 assert(s.ch.split(/\s+/).length<=7);
 assert(s.find.length&&s.advice.length&&s.ann&&s.body.includes('class="drop"'));
 assert(!/Фотографии и лицензии|<script|localStorage/.test(s.body));
}
const slots=[{image:d.cover,alt:d.coverAlt},...d.stops];
const manifest=JSON.parse(read('tools/photo-manifest.json'));
const supplied=slots.filter(s=>s.image!==null);
for(const [i,s] of slots.entries()){
 if(s.image===null){assert.equal(s.alt,null);continue;}
 assert(typeof s.image==='string'&&s.image&&s.alt);
 assert(fs.existsSync(path.join(root,'assets/photos',s.image)));
 const p=manifest.find(p=>p.name===s.image);
 assert(p&&p.day===14&&p.providedByUser===true,'User photograph provenance');
 assert.equal(p.stopId,i?'d14-s'+String(i).padStart(2,'0'):'cover');
 assert.equal(p.alt,s.alt);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='awaiting_photos'){
 assert(supplied.length<4);
 assert(!fs.existsSync(path.join(root,'days/day-14.html')),'No unfinished HTML');
 assert(!/id="day-14"|href="(?:days\/day-14\.html)?#day-14"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 console.log('OK day 14 preparation; '+supplied.length+' accepted photographs, '+(4-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,4);
 const html=read('days/day-14.html');assert(html.includes('День 14 · понедельник, 24 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,3);
 assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),['#d14-s01','#d14-s02','#d14-s03']);
 assert.equal((plan.match(/<div class="row">/g)||[]).length,3);
 for(let i=1;i<=3;i++)assert(html.includes('Остановка '+i+' из 3'));
 for(const row of [d.rows[0],d.rows[4],d.rows[5]])assert(html.includes(row.note));
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
}
