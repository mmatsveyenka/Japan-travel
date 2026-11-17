const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-19.cjs')[0];
// Последний готовый день защищён также при явной сборке следующего.
// Постоянная защита не зависит от наличия служебной папки .tmp.
const day18Hash='b717b914777f6125feabfc6c1ac9478afbdd92f3e973fbbe73f38ffba3139108';
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'days/day-18.html'))).digest('hex'),day18Hash,'Previously completed day 18 changed');
assert.equal(d.number,19);assert.equal(d.date,'суббота, 29 мая');assert.equal(d.title,'Никко');assert.equal(d.jp,'日光');assert.equal(d.color,'#5E7B5A');
assert.equal(new Date(Date.UTC(2027,4,29)).getUTCDay(),6);
assert.equal(d.stops.length,10);assert.equal(d.rows.length,11);
const names=['神橋','日光山輪王寺 三仏堂','輪王寺 大猷院','日光二荒山神社','日光東照宮','滝尾神社','華厳ノ滝','中禅寺湖','日光二荒山神社中宮祠','中禅寺（立木観音）'];
const times=['11:50','12:10','12:35','12:50','13:05','13:55','15:20','днём','днём','днём','20:30'];
assert.deepEqual(d.stops.map(s=>s.jp),names);assert.deepEqual(d.rows.slice(0,10).map(s=>s.jp),names);
assert.deepEqual(d.rows.map(s=>s.time),times);assert.deepEqual(d.stops.map(s=>s.time),times.slice(0,10));
assert.deepEqual(d.rows.slice(0,10).map(s=>s.cardIndex),Array.from({length:10},(_,i)=>i));
assert.equal(d.rows[10].name,'В отеле');assert(!Number.isInteger(d.rows[10].cardIndex)&&!d.rows[10].id);
assert.deepEqual(d.stops.map((s,i)=>s.optional?i:null).filter(i=>i!==null),[5,9]);
assert.deepEqual(d.rows.map((s,i)=>s.optional?i:null).filter(i=>i!==null),[5,9]);
assert.deepEqual(d.stops.map(s=>s.type),['culture','temple','temple','shrine','shrine','shrine','nature','nature','shrine','temple']);
assert(!d.beforeStops&&!d.stops.some(s=>s.duration||s.after),'No invented transfers or durations');
assert.equal(d.stops[3].address,'〒321-1431 栃木県日光市山内2307');
assert.equal(d.stops[8].address,'〒321-1661 栃木県日光市中宮祠2484');
assert.equal(d.stops[9].address,'〒321-1661 栃木県日光市中宮祠2578');
assert.equal(d.stops[7].mapName,'中禅寺湖畔園地');
const notes=[
 '💡 Снимай с берега, чтобы в кадре были мост, река и лес',
 '💡 Верхняя площадка, затем лифт к нижней площадке, если позволяет очередь.',
 '💡 Платный лифт спускает к площадке внизу ущелья. Оттуда водопад ощущается гораздо мощнее: видны потоки воды, скалы и облака брызг.'
];
for(const [i,n] of [[0,notes[0]],[6,notes[1]],[6,notes[2]]]){
 assert(d.rows[i].note.includes(n));assert(d.stops[i].advice.includes(n));
}
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['Без расписания','Бесплатно','—'],['8:00–17:00','¥400','16:30'],['8:00–17:00','¥550','16:30'],
 ['8:00–17:00','Бесплатно','16:30'],['9:00–17:00','¥1 600','16:30'],['Без расписания','Бесплатно','—'],
 ['По зонам','Бесплатно / ¥600','Не указан'],['Без расписания','Не указана','—'],['8:00–17:00','Бесплатно','16:30'],['8:00–17:00','¥500','16:30']
]);
assert.equal(d.research.confirmedForVisit,false);assert.equal(d.research.visit,'2027-05-29');
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Eleven photograph briefs required');
for(const s of d.stops){
 assert(s.jp&&s.kana&&s.en&&s.address&&s.city&&s.vertical);
 assert.equal(s.quick.length,3);assert(s.quick.every(t=>t.split(/\s+/).length<=15));
 assert(s.ch.split(/\s+/).length<=7);assert(s.find.length&&s.advice.length&&s.ann&&s.body.includes('class="drop"'));
 assert(s.sources.length&&s.sources.every(u=>u.startsWith('https://')));
 assert(!/Фотографии и лицензии|<script|localStorage/.test(s.body));
}
const slots=[{image:d.cover,alt:d.coverAlt},...d.stops],manifest=JSON.parse(read('tools/photo-manifest.json'));
const supplied=slots.filter(s=>s.image!==null);
for(const [i,s] of slots.entries()){
 if(s.image===null){assert.equal(s.alt,null);continue;}
 assert(typeof s.image==='string'&&s.image&&s.alt);assert(fs.existsSync(path.join(root,'assets/photos',s.image)));
 const p=manifest.find(p=>p.name===s.image);assert(p&&p.day===19&&p.providedByUser===true);
 assert.equal(p.stopId,i?'d19-s'+String(i).padStart(2,'0'):'cover');assert.equal(p.alt,s.alt);
 assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
 if(s.userApprovedIllustration){
  assert.equal(p.userApprovedIllustration,true);
  assert.equal(p.userInstruction,'используй фотографии которые я тебе прислал');
  assert.equal(s.userInstruction,p.userInstruction);
 }
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='awaiting_photos'){
 assert(supplied.length<11);assert(!fs.existsSync(path.join(root,'days/day-19.html')),'No unfinished HTML');
 assert(!/id="day-19"|href="(?:days\/day-19\.html)?#day-19"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 console.log('OK day 19 preparation; '+supplied.length+' photographs supplied, '+(11-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,11);
 assert.deepEqual(slots.map((s,i)=>s.userApprovedIllustration?i:null).filter(i=>i!==null),[9,10],'Preserve the two explicitly approved illustrations');
 const html=read('days/day-19.html');assert(html.includes('День 19 · суббота, 29 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,10);assert.equal((html.match(/class="optb"/g)||[]).length,2);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:10},(_,i)=>'#d19-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/class="row"/g)||[]).length,11);
 for(let i=1;i<=10;i++)assert(html.includes('Остановка '+i+' из 10'));
 for(const note of notes)assert.equal(html.split(note).length-1,2,'Note must appear in plan and advice');
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
 const section=html.match(/<!-- DAY-19 START -->[\s\S]*?<!-- DAY-19 END -->/)[0];
 assert(read('brochure.html').includes(section.replaceAll('../assets/photos/','assets/photos/').replaceAll('../index.html#index','#index')));
 assert(read('index.html').includes('href="days/day-19.html#day-19"'));
}
