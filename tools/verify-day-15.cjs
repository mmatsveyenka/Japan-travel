const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8'),d=require('./day-15.cjs')[0];
const times=['8:40','10:00','12:00','14:15','15:35','16:20','18:30','19:00'];
assert.equal(d.number,15);assert.equal(d.title,'Саппоро');assert.equal(d.jp,'札幌');assert.equal(d.color,'#4F7C82');
assert.equal(d.date,'вторник, 25 мая');assert.equal(new Date(Date.UTC(2027,4,25)).getUTCDay(),2);
assert.equal(d.stops.length,6);assert.equal(d.rows.length,8);
assert.deepEqual(d.rows.map(s=>s.time),times);
assert.deepEqual(d.rows.map(s=>s.cardIndex),[undefined,0,1,2,3,4,undefined,5]);
assert.deepEqual(d.stops.map(s=>s.jp),['小樽運河','ニッカウヰスキー余市蒸溜所','神威岬','島武意海岸','黄金岬','狸小路商店街・すすきの']);
assert.deepEqual(d.stops.map(s=>s.type),['street','culture','nature','nature','nature','street']);
assert(!d.stops.some(s=>s.optional||s.duration),'No optional stops or invented durations');
assert(d.rows[0].name.includes('северного выхода Sapporo Station'));assert(d.rows[0].note.includes('t1392697/'));
assert(d.stops[0].note.includes('Свободное время для прогулки по каналу, старым улицам, сувенирным магазинам и обеда. Если времени мало, сначала прогуляйся вдоль канала, а потом загляни на Sakaimachi Street.'));
assert(d.stops[0].advice.includes(d.stops[0].note));
assert.equal(d.stops[5].note,'Ужин в Susukino');assert(d.stops[5].advice.includes('Ужин в Susukino.'));
assert.equal(d.stops[4].after.text,'18:30 — 🚌 Вернулись в Саппоро.');
assert(d.beforeStops.text.includes('8:40')&&d.beforeStops.text.includes('札幌駅北口'));
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['Без расписания','Бесплатно','—'],['9:15–16:15','Бесплатно','15:30'],['8:00–18:00','Бесплатно','17:00'],
 ['Без расписания','Не указана','—'],['Без расписания','Не указана','—'],['По заведениям','Бесплатно','—']
]);
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief));
for(const s of d.stops){
 assert(s.jp&&s.kana&&s.en&&s.city&&s.address&&s.type&&s.vertical);
 assert.equal(s.quick.length,3);assert(s.quick.every(t=>t.split(/\s+/).length<=15));assert(s.ch.split(/\s+/).length<=7);
 assert(s.ann&&s.find.length&&s.advice.length&&s.body.includes('class="drop"'));
 assert(!/Фотографии и лицензии|<script|localStorage/.test(s.body));
}
const slots=[{image:d.cover,alt:d.coverAlt},...d.stops],manifest=JSON.parse(read('tools/photo-manifest.json'));
for(const [i,s] of slots.entries()){
 if(s.image===null){assert.equal(s.alt,null);continue;}
 assert(typeof s.image==='string'&&s.image&&s.alt);assert(fs.existsSync(path.join(root,'assets/photos',s.image)));
 const p=manifest.find(p=>p.name===s.image);assert(p&&p.day===15&&p.providedByUser===true);
 assert.equal(p.stopId,i?'d15-s'+String(i).padStart(2,'0'):'cover');assert.equal(p.alt,s.alt);
 assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No image upscaling');
 if(s.userApprovedIllustration){assert.equal(p.userApprovedIllustration,true);assert.equal(p.userInstruction,'используй то, что я прислал');}
}
const supplied=slots.filter(s=>s.image!==null);assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='awaiting_photos'){
 assert(supplied.length<7);assert(!fs.existsSync(path.join(root,'days/day-15.html')));
 assert(!/id="day-15"|href="(?:days\/day-15\.html)?#day-15"/.test(read('index.html')+read('brochure.html')));
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,7);
 const html=read('days/day-15.html');assert(html.includes('День 15 · вторник, 25 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,6);assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.equal((plan.match(/<div class="row">/g)||[]).length,2);
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:6},(_,i)=>'#d15-s'+String(i+1).padStart(2,'0')));
 for(let i=1;i<=6;i++)assert(html.includes('Остановка '+i+' из 6'));
 assert(html.includes(d.stops[0].note)&&html.includes(d.stops[5].note));
 assert(html.indexOf('Возвращение → Саппоро')>html.indexOf('id="d15-s05"'));
 assert(html.indexOf('Возвращение → Саппоро')<html.indexOf('id="d15-s06"'));
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
 console.log('OK day 15: eight schedule rows, six cards and seven user photographs.');
}
