const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-20.cjs')[0];
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'days/day-18.html'))).digest('hex'),'b717b914777f6125feabfc6c1ac9478afbdd92f3e973fbbe73f38ffba3139108','Previously completed day 18 changed');
assert.equal(d.number,20);assert.equal(d.date,'воскресенье, 30 мая');assert.equal(d.title,'Токио');assert.equal(d.jp,'東京');assert.equal(d.color,'#26344D');
assert.equal(new Date(Date.UTC(2027,4,30)).getUTCDay(),0);
const names=['江の島弁財天仲見世通り','江島神社 辺津宮','江島神社 中津宮','江の島サムエル・コッキング苑','江の島シーキャンドル','江島神社 奥津宮','江の島岩屋','稚児ヶ淵','カップヌードルミュージアム 横浜','山下公園','横浜港大さん橋国際客船ターミナル','横浜赤レンガ倉庫','大観覧車「コスモクロック21」','YOKOHAMA AIR CABIN 桜木町駅'];
const times=['10:20','10:35','10:50','11:10','утро','12:20','12:40','днём','16:00','вечер','вечер','вечер','вечер','вечер'];
assert.equal(d.stops.length,14);assert.equal(d.rows.length,14);
assert.deepEqual(d.stops.map(s=>s.jp),names);assert.deepEqual(d.rows.map(s=>s.jp),names);
assert.deepEqual(d.stops.map(s=>s.time),times);assert.deepEqual(d.rows.map(s=>s.time),times);
assert.deepEqual(d.rows.map(s=>s.cardIndex),Array.from({length:14},(_,i)=>i));
assert(!d.beforeStops&&!d.stops.some(s=>s.duration||s.after||s.optional)&&!d.rows.some(s=>s.optional),'No invented transfers, durations or optional stops');
assert.deepEqual(d.stops.map(s=>s.type),['street','shrine','shrine','nature','modern','shrine','nature','nature','culture','nature','modern','culture','modern','modern']);
assert.deepEqual([1,2,5].map(i=>d.stops[i].address),['〒251-0036 神奈川県藤沢市江の島2丁目3-8','〒251-0036 神奈川県藤沢市江の島2丁目3-21','〒251-0036 神奈川県藤沢市江の島2丁目6-15']);
assert.equal(d.stops[8].address,'〒231-0001 神奈川県横浜市中区新港2-3-4');
assert.equal(d.research.workshopDecision,'Обе мастерские');assert.deepEqual(d.stops[8].workshops,['My CUPNOODLES Factory','Chicken Ramen Factory']);
assert.equal(d.stops[8].userUrl,'https://www.cupnoodles-museum.jp/en/yokohama/attractions/mc-factory/');
assert(d.stops[8].advice.some(t=>t.includes('¥1 200'))&&d.stops[8].advice.some(t=>t.includes('за 15 минут')));
assert(d.stops[8].advice.some(t=>t.includes('одного участника')),'Chicken Ramen pair requirement');
assert.equal(d.stops[13].note,'чем позже, тем лучше');assert.equal(d.rows[13].note,'чем позже, тем лучше');assert(d.stops[13].advice.includes('чем позже, тем лучше'));
assert(d.stops[13].address.includes('桜木町1丁目')&&!d.stops[13].address.includes('新港'),'Sakuragicho, not Unga Park contact address');
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['По заведениям','Бесплатно','—'],['8:30–17:00','Бесплатно','—'],['Без расписания','Бесплатно','—'],
 ['9:00–20:00','Бесплатно','19:30'],['9:00–20:00','¥800','19:30'],['Без расписания','Бесплатно','—'],
 ['9:00–17:00','¥500','Не указан'],['Без расписания','Бесплатно','—'],['10:00–18:00','¥500','17:00'],
 ['Без расписания','Бесплатно','—'],['24 часа','Бесплатно','—'],['По корпусам','Бесплатно','—'],
 ['По календарю','¥1 000','Не указан'],['По календарю','¥1 000','Не указан']
]);
assert.equal(d.research.confirmedForVisit,false);assert.equal(d.research.visit,'2027-05-30');
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Fifteen photograph briefs required');
for(const s of d.stops){
 assert(s.jp&&s.kana&&s.en&&s.address&&s.city&&s.vertical);
 assert.equal(s.quick.length,3);assert(s.quick.every(t=>t.split(/\s+/).length<=15));assert(s.ch.split(/\s+/).length<=7);
 assert(s.find.length&&s.advice.length&&s.ann&&s.body.includes('class="drop"'));
 assert(s.sources.length&&s.sources.every(u=>u.startsWith('https://')));
 assert(!/Фотографии и лицензии|<script|localStorage/.test(s.body));
}
const slots=[{image:d.cover,alt:d.coverAlt},...d.stops],manifest=JSON.parse(read('tools/photo-manifest.json'));
const supplied=slots.filter(s=>s.image!==null);
for(const [i,s] of slots.entries()){
 if(s.image===null){assert.equal(s.alt,null);continue;}
 assert(typeof s.image==='string'&&s.image&&s.alt);assert(fs.existsSync(path.join(root,'assets/photos',s.image)));
 const p=manifest.find(p=>p.name===s.image);assert(p&&p.day===20&&p.providedByUser===true);
 assert.equal(p.stopId,i?'d20-s'+String(i).padStart(2,'0'):'cover');assert.equal(p.alt,s.alt);
 assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
 assert.equal(p.userInstruction,'Используй фотографии что я прикрепил, не прося другие.');
 assert.equal(p.sourceKind,'user-provided-file');assert(p.sourceFileName&&/^[a-f0-9]{64}$/.test(p.sourceSha256));
 if(s.userApprovedIllustration){assert.equal(p.userApprovedIllustration,true);assert.equal(s.userInstruction,p.userInstruction);}
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='awaiting_photos'){
 assert(supplied.length<15);assert(!fs.existsSync(path.join(root,'days/day-20.html')),'No unfinished HTML');
 assert(!/id="day-20"|href="(?:days\/day-20\.html)?#day-20"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 console.log('OK day 20 preparation; '+supplied.length+' photographs supplied, '+(15-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,15);
 const html=read('days/day-20.html');assert(html.includes('День 20 · воскресенье, 30 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,14);assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 assert(d.stops[3].verticalSmall&&d.stops[11].verticalSmall,'Six-character photo captions fit 320px');
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:14},(_,i)=>'#d20-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/class="row"/g)||[]).length,14);
 for(let i=1;i<=14;i++)assert(html.includes('Остановка '+i+' из 14'));
 assert.equal(html.split('чем позже, тем лучше').length-1,3,'Note in plan intro, row and advice');
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
 const section=html.match(/<!-- DAY-20 START -->[\s\S]*?<!-- DAY-20 END -->/)[0];
 assert(read('brochure.html').includes(section.replaceAll('../assets/photos/','assets/photos/').replaceAll('../index.html#index','#index')));
 assert(read('index.html').includes('href="days/day-20.html#day-20"'));
}
