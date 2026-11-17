const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-12.cjs')[0];
const times=['8:38','10:40','11:50','12:10','12:50','13:20','днём','вечер','19:05'];
const order=['天橋立ビューランド','智恩寺','天橋立','元伊勢籠神社','天橋立傘松公園','伊根湾めぐり遊覧船（日出）'];
assert.equal(d.title.replaceAll('\u00ad',''),'Аманохасидатэ');
assert.equal(d.date,'суббота, 22 мая');
assert.equal(d.color,'#5E7B5A');
assert.equal(d.stops.length,6);
assert.equal(d.rows.length,9);
assert.deepEqual(d.stops.map(s=>s.jp),order);
assert.deepEqual(d.rows.map(s=>s.time),times);
assert.deepEqual(d.stops.map(s=>s.time),times.slice(1,7));
assert.deepEqual(d.rows.filter(s=>Number.isInteger(s.cardIndex)).map(s=>s.cardIndex),[0,1,2,3,4,5]);
assert.deepEqual(d.rows.filter(s=>!Number.isInteger(s.cardIndex)).map(s=>s.time),['8:38','вечер','19:05']);
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Seven photo briefs required');
assert(!d.stops.some(s=>s.optional||s.duration),'No optional places or durations supplied');
assert.equal(d.rows[1].note,'💡 Обязательно matanozoki — смотреть на Amanohashidate между ног. Chairlift даёт открытые виды, Monorail удобнее, если боитесь высоты.');
assert.equal(d.rows[3].note,'💡 Если погода хорошая — взять велосипед. Всю косу можно пересечь примерно за 20 минут вместо ~50 минут пешком.');
assert.equal(d.rows[5].note,'💡 Сделать matanozoki — отсюда коса должна выглядеть как «мост в небеса».');
assert.equal(d.rows[6].note,'Каждые 30 минут с 09:00 до 16:00');
assert.equal(d.rows[8].name,'В Киото');
assert.equal(d.rows[8].note,'💡 Последний поезд');
assert(d.beforeStops.text.includes('8:38'));
assert(d.stops[5].after.text.includes('Назад на автобусе')&&d.stops[5].after.text.includes('19:05'));
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['9:00–17:30','¥1 000','17:00'],['Без расписания','Бесплатно','—'],
 ['Без расписания','Бесплатно','—'],['8:00–17:00','Бесплатно','Не указан'],
 ['9:00–18:00','¥800','Не указан'],['9:00–16:00','¥1 200','Не указан']
]);
for(const s of d.stops){
 assert(s.jp&&s.kana&&s.en&&s.address&&s.city&&s.type&&s.vertical);
 assert.equal(s.quick.length,3);
 assert(s.quick.every(t=>t.split(/\s+/).length<=15));
 assert(s.ch.split(/\s+/).length<=7);
 assert(s.find.length&&s.advice.length&&s.ann&&s.body);
 assert(s.body.includes('class="drop"'));
 assert(!s.body.includes('Фотографии и лицензии'));
}
for(const i of [1,3,5])assert(d.stops[i-1].advice.includes(d.rows[i].note),'Keep user advice in its card');
const photoSlots=[{image:d.cover,alt:d.coverAlt},...d.stops];
const supplied=photoSlots.filter(s=>s.image!==null);
const photoManifest=JSON.parse(read('tools/photo-manifest.json'));
for(const [i,s] of photoSlots.entries()){
 if(s.image===null){assert.equal(s.alt,null,'Missing image must have no invented alt');continue;}
 assert(typeof s.image==='string'&&s.image&&typeof s.alt==='string'&&s.alt);
 assert(fs.existsSync(path.join(root,'assets/photos',s.image)),'User photo must exist');
 const p=photoManifest.find(p=>p.name===s.image);
 assert(p&&p.day===12&&p.providedByUser===true,'User photograph provenance');
 assert.equal(p.stopId,i?'d12-s'+String(i).padStart(2,'0'):'cover');
 assert.equal(p.alt,s.alt);
 assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No image upscaling');
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length,'Different photographs for all slots');
if(d.status==='awaiting_photos'){
 assert(supplied.length<7,'Activate only after all photographs are accepted');
 assert(!fs.existsSync(path.join(root,'days/day-12.html')),'No unfinished day HTML');
 assert(!/id="day-12"|href="(?:days\/day-12\.html)?#day-12"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 console.log('OK day 12 preparation; '+supplied.length+' accepted photographs, '+(7-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');
 const html=read('days/day-12.html');
 assert(html.includes('День 12 · суббота, 22 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,6);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 assert(!html.includes('class="optb"'));
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.equal((plan.match(/class="row"/g)||[]).length,9);
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),order.map((_,i)=>'#d12-s'+String(i+1).padStart(2,'0')));
 for(let i=1;i<=6;i++)assert(html.includes('Остановка '+i+' из 6'));
 const images=[...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]);
 assert.equal(images.length,7);
 assert.equal(new Set(images).size,7);
 const manifest=JSON.parse(read('tools/photo-manifest.json'));
 for(const name of images){const p=manifest.find(x=>x.name===name);assert(p&&p.day===12&&p.providedByUser===true);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No image upscaling');}
 for(const row of d.rows)if(row.note)assert(html.includes(row.note));
 assert(html.indexOf('Переезд → возвращение')>html.indexOf('id="d12-s06"'));
}
