const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-13.cjs')[0];
const times=['10:30','11:00','11:20','11:40','14:00','15:00','днём'];
const order=['三室戸寺','宇治上神社','興聖寺','平等院','渡月橋','嵐山モンキーパークいわたやま','嵐山・桂川・嵐山公園（中之島地区）'];
assert.equal(d.title,'Киото');assert.equal(d.jp,'京都');assert.equal(d.color,'#B4442C');
assert.equal(d.date,'воскресенье, 23 мая');
assert.equal(new Date(Date.UTC(2027,4,23)).getUTCDay(),0);
assert.equal(d.stops.length,7);assert.equal(d.rows.length,7);
assert.deepEqual(d.stops.map(s=>s.jp),order);
assert.deepEqual(d.stops.map(s=>s.time),times);assert.deepEqual(d.rows.map(s=>s.time),times);
assert.deepEqual(d.rows.map(s=>s.cardIndex),[0,1,2,3,4,5,6]);
assert.deepEqual(d.stops.map((s,i)=>s.optional?i:null).filter(i=>i!==null),[0,1,2]);
assert.deepEqual(d.rows.map(s=>!!s.optional),d.stops.map(s=>!!s.optional));
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Eight photo briefs required');
assert(!d.beforeStops&&!d.stops.some(s=>s.duration||s.after),'No transfers or durations supplied');
assert.equal(d.rows[3].note,'💡 Фениксовый зал и отражение в пруду — лучшие объекты для фотографий');
assert(d.stops[3].advice.includes(d.rows[3].note));
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['8:30–15:10','¥1 000','Не указан'],['5:00–16:00','Бесплатно','Не указан'],
 ['10:00–16:00','¥500','16:00'],['8:45–17:30','¥700','17:15'],
 ['Без расписания','Бесплатно','—'],['9:00–16:00','¥800','Не указан'],['Без расписания','Бесплатно','—']
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
 assert(p&&p.day===13&&p.providedByUser===true,'User photograph provenance');
 assert.equal(p.stopId,i?'d13-s'+String(i).padStart(2,'0'):'cover');
 assert.equal(p.alt,s.alt);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
 if(s.userApprovedIllustration){assert.equal(p.userApprovedIllustration,true);assert.equal(p.userInstruction,'оставь эти фото');}
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='awaiting_photos'){
 assert(supplied.length<8);
 assert(!fs.existsSync(path.join(root,'days/day-13.html')),'No unfinished HTML');
 assert(!/id="day-13"|href="(?:days\/day-13\.html)?#day-13"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 console.log('OK day 13 preparation; '+supplied.length+' accepted photographs, '+(8-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,8);
 const html=read('days/day-13.html');assert(html.includes('День 13 · воскресенье, 23 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,7);
 assert.equal((html.match(/class="optb"/g)||[]).length,3);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),order.map((_,i)=>'#d13-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/class="opt"/g)||[]).length,3);
 for(let i=1;i<=7;i++)assert(html.includes('Остановка '+i+' из 7'));
 assert(html.includes(d.rows[3].note));
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
}
