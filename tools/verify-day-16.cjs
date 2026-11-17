const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-16.cjs')[0];
const times=['7:50','9:35','10:50','12:05','12:50','14:10','16:10','17:55','19:00'];
assert.equal(d.number,16);assert.equal(d.title,'Саппоро');assert.equal(d.jp,'札幌');assert.equal(d.color,'#4F7C82');
assert.equal(d.date,'среда, 26 мая');assert.equal(new Date(Date.UTC(2027,4,26)).getUTCDay(),3);
assert.equal(d.stops.length,7);assert.equal(d.rows.length,9);
assert.deepEqual(d.stops.map(s=>s.jp),['登別地獄谷','地球岬','サイロ展望台','有珠山・昭和新山','昭和新山熊牧場','支笏湖','大通公園']);
assert.deepEqual(d.stops.map(s=>s.type),['nature','nature','modern','nature','culture','nature','nature']);
assert.deepEqual(d.rows.map(s=>s.time),times);
assert.deepEqual(d.rows.map(s=>s.cardIndex),[undefined,0,1,2,3,4,5,undefined,6]);
assert.deepEqual(d.stops.map(s=>s.time),[...times.slice(1,7),times[8]]);
assert(!d.stops.some(s=>s.optional||s.duration),'No optional stops or durations supplied');
const tour='https://www.klook.com/ru/activity/59789-noboribetsu-lake-toya-lake-shikotsu-tour-sapporo-join-day-tour/?dd_referrer=';
assert.equal(d.rows[0].name,'🚌 У северного выхода Sapporo Station');
assert(d.rows[0].note.includes('href="'+tour+'"'));assert(d.beforeStops.text.includes(tour));
assert.equal(d.rows[7].name,'🚌 Вернулись в Саппоро');assert.equal(d.stops[5].after.text,'17:55 — 🚌 Вернулись в Саппоро.');
assert.equal(d.stops.filter(s=>s.after).length,1,'No extra transfers');
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Eight photograph briefs required');
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['24 часа','Бесплатно','—'],['Без расписания','Не указана','—'],['Без расписания','Бесплатно','—'],
 ['По зонам','Не указана','Не указан'],['8:30–17:00','¥1 000','Не указан'],['Без расписания','Не указана','—'],['24 часа','Бесплатно','—']
]);
assert(d.stops[3].mapName.includes('山麓駅'),'Mountain address is the lower ropeway station');
assert(d.stops[3].advice.some(t=>t.includes('отдельный билет')&&t.includes('¥2 000')),'Do not promise an included ropeway ticket');
assert(d.stops[5].mapName==='支笏湖ビジターセンター','Lake address is a confirmed shore landmark');
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
 assert(p&&p.day===16&&p.providedByUser===true,'User photograph provenance');
 assert.equal(p.stopId,i?'d16-s'+String(i).padStart(2,'0'):'cover');
 assert.equal(p.alt,s.alt);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
 if(s.userApprovedIllustration){
  assert.equal(p.userApprovedIllustration,true,'User decision must remain in manifest');
  assert.equal(s.userInstruction,'используй то, что я прислал');
  assert.equal(p.userInstruction,s.userInstruction);
 }
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='awaiting_photos'){
 assert(supplied.length<8);
 assert(!fs.existsSync(path.join(root,'days/day-16.html')),'No unfinished HTML');
 assert(!/id="day-16"|href="(?:days\/day-16\.html)?#day-16"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 assert(!read('index.html').includes('→ Ноборибэцу → Муроран → Тоя → Собэцу → Сикоцу'),'Unfinished route must not be advertised');
 console.log('OK day 16 preparation; '+supplied.length+' photographs supplied, '+(8-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,8);
 assert(read('index.html').includes('→ Ноборибэцу → Муроран → Тоя → Собэцу → Сикоцу → Саппоро'),'Ready route missing');
 const html=read('days/day-16.html');assert(html.includes('День 16 · среда, 26 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,7);
 assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:7},(_,i)=>'#d16-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/<div class="row">/g)||[]).length,2);
 for(let i=1;i<=7;i++)assert(html.includes('Остановка '+i+' из 7'));
 assert(html.includes('href="'+tour+'"'));
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
 const section=html.match(/<!-- DAY-16 START -->[\s\S]*?<!-- DAY-16 END -->/)[0];
 assert(read('brochure.html').includes(section.replaceAll('../assets/photos/','assets/photos/').replaceAll('../index.html#index','#index')),'Combined day 16 differs');
}
