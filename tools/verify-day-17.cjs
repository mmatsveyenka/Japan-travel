const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-17.cjs')[0];
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'days/day-16.html'))).digest('hex'),'28535a6e268c9208fe1d66b9bef6480772ce702df83c17eba3d3e87d03132d97','Previously completed day 16 changed');
const times=['9:20','10:10','11:00','12:40','13:45','18:15','20:50'];
assert.equal(d.number,17);assert.equal(d.title,'Саппоро → Токио');assert.equal(d.jp,'札幌 → 東京');
assert.equal(d.color,'#4F7C82');assert.equal(d.date,'четверг, 27 мая');
assert.equal(new Date(Date.UTC(2027,4,27)).getUTCDay(),4);
assert.equal(d.stops.length,5);assert.equal(d.rows.length,7);
assert.deepEqual(d.stops.map(s=>s.jp),['二条市場','大通公園','白い恋人パーク','北海道神宮','サッポロビール博物館']);
assert.deepEqual(d.stops.map(s=>s.type),['street','nature','culture','shrine','culture']);
assert.deepEqual(d.rows.map(s=>s.time),times);assert.deepEqual(d.stops.map(s=>s.time),times.slice(0,5));
assert.deepEqual(d.rows.map(s=>s.cardIndex),[0,1,2,3,4,undefined,undefined]);
assert(!d.beforeStops&&!d.stops.some(s=>s.optional||s.duration),'No additional transfers, optional places or durations');
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['По заведениям','Бесплатно','—'],['24 часа','Бесплатно','—'],['10:00–18:00','¥1 200','16:30'],['6:00–17:00','Бесплатно','Не указан'],['11:00–18:00','¥1 000','17:30']
]);
const notes=[
 '💡 Chocotopia House и другие экспозиции<br>💡 Chocolate Lounge OXFORD<br>💡 Прогулка по двору, саду и фотографии',
 '💡 Самостоятельный осмотр музея<br>💡 Дегустация трёх сортов пива<br>💡 Сувенирный магазин<br>💡 Покушать в Kessel Hall / Kaitakushi-kan баранину Jingisukan'
];
for(const [i,note] of [[2,notes[0]],[4,notes[1]]]){
 assert.equal(d.rows[i].note,note);assert.equal(d.stops[i].note,note);
 for(const line of note.split('<br>'))assert(d.stops[i].advice.includes(line),'Preserve user note');
}
assert.equal(d.rows[5].name,'✈️ Летим в Токио');assert.equal(d.rows[6].name,'🏨 Заселяемся в Токио');
assert.equal(d.stops[4].after.text,'18:15 — ✈️ Летим в Токио.<br>20:50 — 🏨 Заселяемся в Токио.');
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Six photograph briefs required');
for(const s of d.stops){
 assert(s.jp&&s.kana&&s.en&&s.address&&s.city&&s.vertical);
 assert.equal(s.quick.length,3);assert(s.quick.every(t=>t.split(/\s+/).length<=15));
 assert(s.ch.split(/\s+/).length<=7);assert(s.find.length&&s.advice.length&&s.ann&&s.body.includes('class="drop"'));
 assert(!/Фотографии и лицензии|<script|localStorage/.test(s.body));
}
// Частично полученные снимки допустимы в рабочих данных, но не в публичной странице.
const slots=[{image:d.cover,alt:d.coverAlt},...d.stops],manifest=JSON.parse(read('tools/photo-manifest.json'));
const supplied=slots.filter(s=>s.image!==null);
for(const [i,s] of slots.entries()){
 if(s.image===null){assert.equal(s.alt,null);continue;}
 assert(typeof s.image==='string'&&s.image&&s.alt);assert(fs.existsSync(path.join(root,'assets/photos',s.image)));
 const p=manifest.find(p=>p.name===s.image);assert(p&&p.day===17&&p.providedByUser===true);
 assert.equal(p.stopId,i?'d17-s'+String(i).padStart(2,'0'):'cover');assert.equal(p.alt,s.alt);
 assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='awaiting_photos'){
 assert(supplied.length<6);assert(!fs.existsSync(path.join(root,'days/day-17.html')),'No unfinished HTML');
 assert(!/id="day-17"|href="(?:days\/day-17\.html)?#day-17"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 console.log('OK day 17 preparation; '+supplied.length+' photographs supplied, '+(6-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,6);
 const html=read('days/day-17.html');assert(html.includes('День 17 · четверг, 27 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,5);assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:5},(_,i)=>'#d17-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/<div class="row">/g)||[]).length,2);
 for(let i=1;i<=5;i++)assert(html.includes('Остановка '+i+' из 5'));
 for(const note of notes)assert(html.includes(note));
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
 const section=html.match(/<!-- DAY-17 START -->[\s\S]*?<!-- DAY-17 END -->/)[0];
 assert(read('brochure.html').includes(section.replaceAll('../assets/photos/','assets/photos/').replaceAll('../index.html#index','#index')));
 const route=read('index.html').match(/<p class="ix-route">([^<]+)<\/p>/)[1];
 assert(route.includes('Саппоро → Токио'),'Ready route must include day 17 arrival in Tokyo');
}
