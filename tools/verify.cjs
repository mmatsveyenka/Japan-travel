const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dayFiles=fs.readdirSync(path.join(root,'days')).filter(n=>/^day-\d{2}\.html$/.test(n)).sort().map(n=>'days/'+n);
const files=['index.html','brochure.html',...dayFiles,'reference.html'];
const sourceCss=fs.readFileSync(path.join(root,'reference.html'),'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
require('./verify-day-12.cjs');
require('./verify-day-13.cjs');
require('./verify-day-14.cjs');
require('./verify-day-15.cjs');
require('./verify-day-16.cjs');
require('./verify-day-17.cjs');
require('./verify-day-18.cjs');
require('./verify-day-19.cjs');
require('./verify-day-20.cjs');
require('./verify-day-21.cjs');
const eleventh=require('./day-11.cjs')[0];
const day11Times=['10:15','11:00','13:40','15:15','16:00','16:35','вечер','вечер','вечер'];
const day11Order=['東本願寺','京都鉄道博物館','錦市場','八坂神社','霊山観音','清水寺','太秦映画村','寺町京極商店街・新京極商店街','先斗町・木屋町・鴨川'];
assert.equal(eleventh.title,'Киото');
assert.equal(eleventh.date,'пятница, 21 мая');
assert.equal(eleventh.color,'#B4442C');
assert.equal(eleventh.stops.length,9,'Day 11 has nine cards, including three optional places');
assert.deepEqual(eleventh.stops.map(s=>s.jp),day11Order,'Day 11 user order');
assert.deepEqual(eleventh.stops.map(s=>s.time),day11Times,'Day 11 card times');
assert.deepEqual(eleventh.rows.map(s=>s.time),day11Times,'Day 11 evening confirmed by user');
assert.deepEqual(eleventh.rows.map(s=>s.cardIndex),[0,1,2,3,4,5,6,7,8]);
assert.deepEqual(eleventh.stops.map((s,i)=>s.optional?i:null).filter(i=>i!==null),[4,7,8]);
assert.deepEqual(eleventh.rows.map(s=>!!s.optional),eleventh.stops.map(s=>!!s.optional));
assert(eleventh.coverBrief&&eleventh.stops.every(s=>s.photoBrief),'Ten photo briefs required');
assert(!eleventh.beforeStops&&!eleventh.stops.some(s=>s.duration||s.after),'No transfers or durations supplied');
assert.deepEqual(eleventh.stops[1].practical,['10:00–17:00','¥1 900','16:30'],'Museum announced tariff from March 2027');
assert.deepEqual(eleventh.stops[4].practical,['8:40–16:20','¥300','16:00'],'Ryozen admission closes at user arrival time');
assert.deepEqual(eleventh.stops[6].practical,['10:00–21:00','Не указана','20:00'],'Do not carry pre-renewal tariff into May 2027');
for(const s of eleventh.stops){
 assert(s.jp&&s.kana&&s.en&&s.city&&s.address&&s.type&&s.vertical);
 assert.equal(s.practical.length,3);
 assert.equal(s.quick.length,3);
 assert(s.quick.every(p=>p.split(/\s+/).length<=15),'Day 11 summary over 15 words');
 assert(s.find.length&&s.advice.length&&s.body,'Incomplete day 11 text');
 assert(s.ch.split(/\s+/).length<=7,'Day 11 plan description too long');
}
if(eleventh.status==='awaiting_photos'){
 assert(!fs.existsSync(path.join(root,'days/day-11.html')),'Unfinished day 11 must not be published');
 assert(!/id="day-11"|href="(?:days\/day-11\.html)?#day-11"/.test(read('brochure.html')+read('index.html')),'Unfinished day 11 activated');
 assert.equal(eleventh.cover,null);
 assert(eleventh.stops.every(s=>s.image===null&&s.alt===null),'No invented photographs or alt texts');
 console.log('OK day 11 preparation; ten user photographs awaited.');
}else{
 assert.equal(eleventh.status,'ready');
 const html=read('days/day-11.html');
 assert(html.includes('День 11 · пятница, 21 мая'));
 assert(html.includes('<h1 class="city">Киото</h1>'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),day11Times);
 assert.equal((html.match(/class="stop"/g)||[]).length,9);
 assert.equal((html.match(/class="optb"/g)||[]).length,3);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const articles=[...html.matchAll(/<article class="stop"[\s\S]*?<\/article>/g)].map(m=>m[0]);
 assert.deepEqual(articles.map((a,i)=>a.includes('class="optb"')?i:null).filter(i=>i!==null),[4,7,8]);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:9},(_,i)=>'#d11-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/class="opt"/g)||[]).length,3);
 for(let i=1;i<=9;i++)assert(html.includes('Остановка '+i+' из 9'));
 const names=[...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]);
 assert.equal(names.length,10);
 assert.equal(new Set(names).size,10,'Day 11 photographs must be different');
 const photoManifest=JSON.parse(read('tools/photo-manifest.json'));
 for(const name of names){const p=photoManifest.find(x=>x.name===name);assert(p&&p.day===11&&p.providedByUser===true,'Day 11 requires user photo '+name);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'Upscaled day 11 image');}
}
const tenth=require('./day-10.cjs')[0];
const day10Times=['8:00','утро','утро','утро','утро','9:30','12:00','13:10','днём','16:00','19:00'];
const day10Order=['原爆ドーム','原爆の子の像','平和の灯','平和記念公園','原爆死没者慰霊碑','広島平和記念資料館','姫路城','好古園','八坂の塔・東山・祇園'];
assert.equal(tenth.title,'Хиросима','Day 10 heading supplied by user');
assert.equal(tenth.date,'четверг, 20 мая','Day 10 date');
assert.equal(tenth.stops.length,9,'Day 10 has nine cards');
assert.deepEqual(tenth.stops.map(s=>s.jp),day10Order,'Day 10 user order');
assert.deepEqual(tenth.rows.map(s=>s.time),day10Times,'Day 10 user times');
assert.deepEqual(tenth.rows.filter(s=>Number.isInteger(s.cardIndex)).map(s=>s.cardIndex),[0,1,2,3,4,5,6,7,8]);
assert.deepEqual(tenth.rows.filter(s=>!Number.isInteger(s.cardIndex)).map(s=>s.time),['12:00','16:00'],'Only transfers are unlinked');
assert(!tenth.stops.some(s=>s.optional||s.duration),'No optional places or durations supplied');
assert(tenth.coverBrief&&tenth.stops.every(s=>s.photoBrief),'All ten user photographs need briefs');
for(const s of tenth.stops){
 assert(s.jp&&s.kana&&s.en&&s.city&&s.address,'Day 10 local-language fields');
 assert.equal(s.practical.length,3);
 assert.equal(s.quick.length,3);
 assert(s.find.length&&s.advice.length&&s.body,'Incomplete day 10 text');
}
for(const note of ['Motoyasu River','отражение здания','свободное пространство','Cenotaph','тысячи бумажных журавликов','через арку был виден Atomic Bomb Dome','Открывается в 9','Otemae-dori','все 9 садов','Hōkan-ji','Ninenzaka','Sannenzaka','Higashiyama','Hanamikoji','Shirakawa'])assert(JSON.stringify(tenth).includes(note),'Day 10 missing note '+note);
assert.equal(tenth.stops[5].after.text,'12:00 — синкансэн в Химедзи.');
assert.equal(tenth.stops[7].after.text,'16:00 — едем в Киото.');
assert.deepEqual(tenth.stops[5].practical,['7:30–19:00','¥200','18:30'],'Museum current municipal hours');
assert.deepEqual(tenth.stops[6].practical,['9:00–17:00','¥2 500','16:00'],'Castle current adult ticket');
assert.deepEqual(tenth.stops[7].practical,['9:00–17:00','¥400','16:30'],'Garden current adult ticket');
if(tenth.status==='awaiting_photos'){
 assert(!fs.existsSync(path.join(root,'days/day-10.html')),'Unfinished day 10 must not be published');
 assert(!/id="day-10"|href="(?:days\/day-10\.html)?#day-10"/.test(read('brochure.html')+read('index.html')),'Unfinished day 10 activated');
 assert.equal(tenth.cover,null,'No invented cover before photographs');
 assert(tenth.stops.every(s=>s.image===null),'No invented stop photographs');
 console.log('OK day 10 preparation; ten user photographs awaited.');
}else{
 assert.equal(tenth.status,'ready','Unrecognised day 10 status');
 const html=read('days/day-10.html');
 assert(html.includes('День 10 · четверг, 20 мая'));
 assert(html.includes('<h1 class="city">Хиросима</h1>'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),day10Times);
 assert.equal((html.match(/class="stop"/g)||[]).length,9);
 assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:9},(_,i)=>'#d10-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/<div class="row">/g)||[]).length,2);
 for(let i=1;i<=9;i++)assert(html.includes('Остановка '+i+' из 9'));
 const names=[...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]);
 assert.equal(names.length,10);
 const photoManifest=JSON.parse(read('tools/photo-manifest.json'));
 for(const name of names){const p=photoManifest.find(x=>x.name===name);assert(p&&p.day===10&&p.providedByUser===true,'Day 10 requires user photo '+name);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'Upscaled day 10 image');}
 const articles=[...html.matchAll(/<article class="stop"[\s\S]*?<\/article>/g)].map(m=>m[0]);
 assert(html.indexOf('Переезд → Химедзи')>html.indexOf(articles[5]));
 assert(html.indexOf('Переезд → Химедзи')<html.indexOf(articles[6]));
 assert(html.indexOf('Переезд → Киото')>html.indexOf(articles[7]));
 assert(html.indexOf('Переезд → Киото')<html.indexOf(articles[8]));
}
const ninth=require('./day-09.cjs')[0];
assert.equal(ninth.title,'Миядзима','Day 9 title');
assert.equal(ninth.date,'среда, 19 мая','Day 9 date');
assert.equal(ninth.stops.length,10,'Day 9 has ten sightseeing places');
assert(!ninth.stops.some(s=>s.optional),'No optional day 9 stops were supplied');
const day9Times=['9:00','9:50','10:20','10:30','11:00','11:45','13:00','14:00','днём','15:00','вечер'];
assert.deepEqual(ninth.rows.map(s=>s.time),day9Times,'Day 9 user schedule');
assert.deepEqual(ninth.stops.map(s=>s.jp),['嚴島神社','嚴島神社 大鳥居','嚴島神社 五重塔','豊国神社（千畳閣）','大聖院','宮島表参道商店街','紅葉谷公園','宮島ロープウエー','獅子岩展望台','弥山山頂'],'Day 9 order');
assert.equal(ninth.rows.at(-1).name,'Прогулка по вечерней Хиросиме и ресторан');
assert.equal(ninth.rows.at(-1).ch,'Отметить день рождения');
assert(!('cardIndex' in ninth.rows.at(-1)),'Unspecified evening has no sightseeing card');
for(const note of ['19 мая 2027','100 см','Очень фотогеничная связка','открытую веранду','маленькие статуи','Momiji Manju','местные устрицы','спуск до 16:30'])assert(JSON.stringify(ninth).includes(note),'Day 9 missing user note '+note);
assert(ninth.coverBrief&&ninth.stops.every(s=>s.photoBrief),'Day 9 requires all eleven photo briefs');
for(const s of ninth.stops){
 assert(s.jp&&s.kana&&s.en&&s.address,'Day 9 local-language information missing');
 assert.equal(s.practical.length,3,'Day 9 practical fields');
 assert.equal(s.quick.length,3,'Day 9 quick summary');
 assert(s.find.length&&s.advice.length&&s.body,'Day 9 text incomplete');
}
if(ninth.status==='awaiting_photos'){
 assert(!fs.existsSync(path.join(root,'days/day-09.html')),'Unfinished day 9 must not be published');
 assert(!/id="day-09"|href="(?:days\/day-09\.html)?#day-09"/.test(read('brochure.html')+read('index.html')),'Unfinished day 9 activated');
 console.log('OK day 9 preparation; eleven user photographs awaited.');
}else{
 assert.equal(ninth.status,'ready','Unrecognised day 9 status');
 const html=read('days/day-09.html');
 assert(html.includes('День 9 · среда, 19 мая'),'Day 9 date in HTML');
 assert(html.includes('<h1 class="city">Миядзима</h1>'),'Day 9 heading');
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),day9Times,'Day 9 HTML schedule');
 assert.equal((html.match(/class="stop"/g)||[]).length,10);
 assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:10},(_,i)=>'#d09-s'+String(i+1).padStart(2,'0')));
 assert.equal((plan.match(/<div class="row">/g)||[]).length,1,'Evening remains unlinked');
 for(let i=1;i<=10;i++)assert(html.includes('Остановка '+i+' из 10'),'Day 9 plate');
 const names=[...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]);
 assert.equal(names.length,11,'Day 9 cover and ten photographs');
 const manifest=JSON.parse(read('tools/photo-manifest.json'));
 for(const name of names){const p=manifest.find(x=>x.name===name);assert(p&&p.day===9&&p.providedByUser===true,'Day 9 requires user photograph '+name);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'Upscaled day 9 image');}
}
const eighth=require('./day-08.cjs')[0];
if(eighth.status==='awaiting_photos'){
 assert(!fs.existsSync(path.join(root,'days/day-08.html')),'Unfinished day 8 must not be published');
 assert(!/id="day-08"|href="(?:days\/day-08\.html)?#day-08"/.test(read('brochure.html')+read('index.html')),'Unfinished day 8 activated');
 assert.equal(eighth.title,'Фукуока → Хиросима','User-confirmed day 8 destination');
 assert.equal(eighth.stops.filter(s=>s.optional).length,3,'Day 8 optional places');
 assert.deepEqual(eighth.rows.filter(s=>/\d/.test(s.time)).map(s=>s.time),['9:50','13:15','14:00','16:43','18:45'],'Day 8 user times');
 assert.equal(eighth.stops.length+1,7,'Day 8 photo brief: cover and six places');
 assert(eighth.coverBrief&&eighth.stops.every(s=>s.photoBrief),'Missing day 8 photo brief');
 console.log('OK day 8 preparation; page awaits user photographs.');
}else{
 const html=read('days/day-08.html');
 assert(html.includes('День 8 · вторник, 18 мая'),'Day 8 date');
 assert(html.includes('<h1 class="city">Фукуока → Хиросима</h1>'),'Day 8 confirmed destination');
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),['9:50','13:15','14:00','днём','16:43','днём','днём','18:45'],'Day 8 schedule');
 assert.equal((html.match(/class="stop"/g)||[]).length,6,'Day 8 has six sightseeing cards');
 assert.equal((html.match(/class="optb"/g)||[]).length,3,'Day 8 optional places');
 assert.equal((html.match(/class="back"/g)||[]).length,2,'Day 8 navigation');
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<div class="nm">([^<]+)/g)].map(m=>m[1]),['Дадзайфу Тэммангу','Palm Tree Swing','Парные скалы Футамигаура','Прогулка по берегу','Святилище Кусида','Храм Тотё-дзи','Святилище Сумиёси','🚂 Едем в Хиросиму'],'Starbucks and Monzen must remain notes, not separate plan entries');
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),['#d08-s01','#d08-s02','#d08-s03','#d08-s03','#d08-s04','#d08-s05','#d08-s06'],'Day 8 plan links');
 assert.equal((plan.match(/<div class="row">/g)||[]).length,1,'Train remains an unlinked event');
 const first=html.match(/<article class="stop" id="d08-s01">[\s\S]*?<\/article>/)[0];
 for(const note of ['Starbucks Dazaifu','Мондзэн-мати','Monzen-machi','Быстрая фототочка.','отсюда до аэропорта полтора часа','Обязательно посмотреть огромный Kazariyama — праздничную платформу Yamakasa'])assert(html.includes(note),'Day 8 missing note '+note);
 for(const note of ['Starbucks Dazaifu','Мондзэн-мати'])assert(first.includes(note),'Dazaifu missing its subsidiary visit '+note);
 for(let i=1;i<=6;i++)assert(html.includes('Остановка '+i+' из 6'),'Day 8 plate');
 console.log('OK day 8 schedule, subsidiary notes and six cards.');
}
const approved={'days/day-01.html':'678e2b51deaf19735b471e5543e398d92935e13d1ddbe7ee1a99de3d93497a46','days/day-02.html':'d67705500a4594c95902846b708cb2f3a84d0bf53b07eef134c149fb4b1cc83f','reference.html':'c65a1149c87149328d4d5c2d161bc1b7628af7b91ce4f9b01ed6a4d967d2d597'};
approved['days/day-08.html']='a3f032b32bd4319d330c0640077cdf2a16cd4a9b5f3be3b0f071af4cc1645e27';
for(const [file,hash] of Object.entries(approved))assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Approved file changed: '+file);
const rootPaths=html=>html.replaceAll('../assets/photos/','assets/photos/').replaceAll('../index.html#index','index.html#index');
const body=html=>html.match(/<body>([\s\S]*?)<\/body>/)[1].trim();
assert.equal(body(read('reference.html')),body(rootPaths(read('days/day-02.html'))),'Reference must match approved day 2');
const dayOne=read('days/day-01.html');
assert.deepEqual([...dayOne.matchAll(/class="tm">([^<]+)</g)].map(m=>m[1]),['14:30','19:00','22:30'],'Day 1 schedule changed');
for(const note of ['Перекус в аэропорту','Покупать в феврале'])assert(dayOne.includes(note),'Missing day 1 note');
assert(!/class="stop"|class="practical"/.test(dayOne),'Unrequested sightseeing blocks in travel day');
assert.equal((dayOne.match(/class="back"/g)||[]).length,2,'Day 1 navigation');
const dayOneSection=dayOne.match(/<!-- DAY-01 START -->[\s\S]*?<!-- DAY-01 END -->/)[0];
assert(read('brochure.html').includes(rootPaths(dayOneSection).replaceAll('index.html#index','#index')),'Combined day 1 differs');
const voids=new Set(['meta','img','br','hr','link','input','wbr']);
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert.equal(html.match(/<style>([\s\S]*?)<\/style>/)[1],sourceCss,'CSS mismatch '+file);
 assert(sourceCss.includes('.way{margin-top:24px;padding-top:0;border-top:0}'),'Transfer spacing rule missing');
 assert(sourceCss.includes('.way.day-end{margin-top:0;padding-top:0;border-top:0}'),'Footer spacing rule missing');
 assert.equal((html.match(/class="way day-end"/g)||[]).length,file==='index.html'?0:file==='brochure.html'?dayFiles.length:1,'Footer container missing '+file);
 assert(!html.includes('<div class="way"><a class="back"'),'Old footer divider recreated '+file);
 const markup=html.replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<!--[\s\S]*?-->/g,'');
 const ids=new Set(),stack=[];
 for(const m of markup.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi)){
  const raw=m[0],tag=m[1].toLowerCase();
  if(raw.startsWith('</')){assert.equal(stack.pop(),tag,'Unbalanced '+file+': '+raw);continue;}
  const id=raw.match(/\bid="([^"]+)"/);if(id){assert(!ids.has(id[1]),'Duplicate ID');ids.add(id[1]);}
  if(/class="(?:find|here)"/.test(raw))assert(!stack.includes('details'),'Advice hidden inside details');
  if(/class="story"/.test(raw))assert(!/\bopen\b/.test(raw),'History open by default');
  if(!voids.has(tag))stack.push(tag);
 }
 assert.equal(stack.length,0,'Unclosed tags');
 for(const m of markup.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|data:)/.test(m[1]))continue;
  const [rel,hash]=m[1].split('#');
  const target=rel?path.resolve(root,path.dirname(file),rel):path.join(root,file);
  assert(fs.existsSync(target),'Missing local file '+m[1]);
  if(hash){const targetHtml=fs.readFileSync(target,'utf8');assert(targetHtml.includes('id="'+hash+'"'),'Broken anchor '+m[1]);}
 }
 assert(!/localStorage|type="checkbox"|<script/.test(markup));
 for(const article of markup.matchAll(/<article class="stop"[\s\S]*?<\/article>/g)){
  const body=article[0];
  const practical=body.match(/<section class="practical"[\s\S]*?<\/section>/)[0];
  assert.deepEqual([...practical.matchAll(/class="k">([^<]+)</g)].map(m=>m[1]),['Часы работы','Стоимость','Последний вход'],'Practical must contain exactly three fields');
  assert.equal((practical.match(/class="v"/g)||[]).length,3);
  assert(!/<h[1-6]|class="checked"|Текущие сведения проверены|1440|710/.test(practical),'Extra practical content');
  assert(body.indexOf('class="btns"')<body.indexOf('class="practical"'),'Practical block before buttons');
  assert(body.indexOf('class="practical"')<body.indexOf('class="s30"'),'Practical block below summary');
  assert(body.indexOf('class="find"')<body.indexOf('class="here"'),'Find list after advice');
  assert(body.indexOf('class="here"')<body.indexOf('class="story"'),'History before practical advice');
 }
 if(file==='index.html'||file==='brochure.html'){
  assert.equal((html.match(/class="tile /g)||[]).length,21);
  assert.equal((html.match(/class="tile on"/g)||[]).length,dayFiles.length);
 }
 if(file.includes('day-02')||file==='brochure.html'){
  assert.equal((html.match(/class="stop"/g)||[]).length,file==='brochure.html'?dayFiles.reduce((n,f)=>n+(read(f).match(/class="stop"/g)||[]).length,0):5);
  for(const t of ['12:30','15:15','15:50','16:10','19:00'])assert(html.includes(t));
  for(const hint of ['Chohichiya','Blue Seal'])assert(html.includes(hint));
 }
 console.log('OK '+file);
}
for(const [nn,times] of [['03',['10:00','11:00','днём','13:40','14:40','17:15','19:30','20:00']],['04',['7:35','10:20','11:50','14:30','16:00','16:30','20:00']]]){
 const html=read('days/day-'+nn+'.html');
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times,'Schedule '+nn);
 assert.equal((html.match(/class="stop"/g)||[]).length,6);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 assert.equal((html.match(/class="optb"/g)||[]).length,nn==='03'?1:0);
 for(let i=1;i<=6;i++)assert(html.includes('Остановка '+i+' из 6'));
 const section=html.match(new RegExp('<!-- DAY-'+nn+' START -->[\\s\\S]*?<!-- DAY-'+nn+' END -->'))[0];
 assert(read('brochure.html').includes(rootPaths(section).replaceAll('index.html#index','#index')),'Combined day differs '+nn);
}
for(const note of ['Забронируйте экскурсию заранее','Hakata Station → Canal City → Nakasu','Nakasu Yatai'])assert(read('days/day-03.html').includes(note));
for(const note of ['снизу','шаттл','прощаетесь с группой','129204-takachiho'])assert(read('days/day-04.html').includes(note));
const sixth=read('days/day-06.html');
assert.deepEqual([...sixth.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),['9:20','10:10','10:35','11:33','12:30','13:45','14:20','15:56','18:20','вечер'],'Day 6 schedule');
assert(sixth.includes('День 6 · воскресенье, 16 мая'));
assert.equal((sixth.match(/class="stop"/g)||[]).length,8);
assert.equal((sixth.match(/class="optb"/g)||[]).length,0);
assert.equal((sixth.match(/class="back"/g)||[]).length,2);
for(const note of ['13:40','Tenso Shrine','Mt. Yufu','Yufuin no Mori','Canal City → Naka River → Fukuoka Deai Bridge → Nakasu yatai'])assert(sixth.includes(note),'Day 6 missing note '+note);
for(let i=1;i<=8;i++)assert(sixth.includes('Остановка '+i+' из 8'));
const plan6=sixth.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
assert.equal((plan6.match(/<div class="row">/g)||[]).length,2,'Train and hotel unlinked');
assert.deepEqual([...plan6.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:8},(_,i)=>'#d06-s'+String(i+1).padStart(2,'0')));
const fifth=read('days/day-05.html');
const seventh=read('days/day-07.html');
assert.equal(require('node:crypto').createHash('sha256').update(seventh).digest('hex'),'b187c7764962d4d850d7e425fdba5029fecbd1e3d31c75cdedd7a2067aee88d1','Prior day 7 changed');
assert(seventh.includes('День 7 · понедельник, 17 мая'),'Day 7 date');
assert.deepEqual([...seventh.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),['утро','утро','утро','11:45','днём','днём','днём','днём','19:00'],'Day 7 schedule');
assert.equal((seventh.match(/class="stop"/g)||[]).length,8,'Day 7: two alternative walks and six required places');
assert.equal((seventh.match(/class="optb"/g)||[]).length,2,'Only the two morning alternatives are optional');
assert(seventh.includes('замок с Майдзуру или Охори'),'Morning choice missing');
for(const note of ['💡 Обед здесь!','Лучший кадр — смотреть вдоль всей линии ворот сверху','180212-north-kyushu-day-tour-karato-market-motonosumi-shrine-mt-saraku/'])assert(seventh.includes(note),'Day 7 missing note '+note);
const plan7=seventh.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
assert.equal((plan7.match(/<div class="row">/g)||[]).length,1,'Gathering is not a sightseeing card');
assert.deepEqual([...plan7.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:8},(_,i)=>'#d07-s'+String(i+1).padStart(2,'0')),'Day 7 order');
assert.equal((seventh.match(/class="back"/g)||[]).length,2);
for(let i=1;i<=8;i++)assert(seventh.includes('Остановка '+i+' из 8'),'Day 7 plate');
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'days/day-06.html'))).digest('hex'),'fc8ae0dc6c5ecbba48638534a8c6a63d7c99a9ab60264d4ec9536ca8b9232c2b','Prior day 6 changed');
assert.deepEqual([...fifth.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),['10:50','16:13','19:30','вечер'],'Day 5 schedule');
assert(fifth.includes('День 5 · суббота, 15 мая'),'Day 5 date');
assert.equal((fifth.match(/class="stop"/g)||[]).length,2,'Only volcano and Kitahama have sightseeing cards');
assert.equal((fifth.match(/class="optb"/g)||[]).length,0);
assert.equal((fifth.match(/class="back"/g)||[]).length,2);
for(const note of ['💡 В 9:14 автобус','💡 В 15:38 автобус','💡 В 16:48 автобус','Погулять по Kitahama'])assert(fifth.includes(note),'Day 5 note: '+note);
for(let i=1;i<=2;i++)assert(fifth.includes('Остановка '+i+' из 2'));
const fifthPlan=fifth.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
assert.deepEqual([...fifthPlan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),['#d05-s01','#d05-s02'],'Day 5 sightseeing links');
assert.equal((fifthPlan.match(/<div class="row">/g)||[]).length,2,'City arrivals remain unlinked');
assert(fifth.indexOf('Переезд → Асо → Беппу')>fifth.indexOf('id="d05-s01"'));
assert(fifth.indexOf('Переезд → Асо → Беппу')<fifth.indexOf('id="d05-s02"'));
for(const [file,hash] of Object.entries({'days/day-03.html':'bdda77460057de686566d13ae5b0b72e211d812aeaa2ba78e065e02ffc4499c1','days/day-04.html':'d8bab4bcf5c5953e581e03aeea6e2f16cc3d3090865318226c65a958fdece2d2','days/day-05.html':'0532ee62d64073a2a7d0cadf3fab5f0c829409e30c9b1ad5a147037823274e6e'}))assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Prior day changed: '+file);
for(const file of dayFiles){const nn=file.match(/day-(\d+)/)[1],section=read(file).match(new RegExp('<!-- DAY-'+nn+' START -->[\\s\\S]*?<!-- DAY-'+nn+' END -->'))[0];assert(read('brochure.html').includes(rootPaths(section).replaceAll('index.html#index','#index')),'Combined day differs '+nn);}
const usedPhotos=dayFiles.flatMap(f=>[...read(f).matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]));assert.equal(new Set(usedPhotos).size,usedPhotos.length,'Repeated photograph in itinerary');
for(const file of fs.readdirSync(path.join(root,'assets/photos'))){const b=fs.readFileSync(path.join(root,'assets/photos',file));assert.equal(b.readUInt16BE(0),0xffd8,'Not JPEG '+file);}

const manifest=JSON.parse(read('tools/photo-manifest.json'));
const day7Photos=[...seventh.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]);
assert.equal(day7Photos.length,9,'Day 7 cover and eight stop images');
for(const name of day7Photos){const p=manifest.find(x=>x.name===name);assert(p,'Day 7 photo missing from manifest: '+name);assert.equal(p.day,7);assert(p.providedByUser===true||typeof p.attributionRequired==='boolean','Missing photo provenance: '+name);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'Upscaled photograph '+name);}
if(eighth.status==='ready'){
 const names=[...read('days/day-08.html').matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]);
 assert.equal(names.length,7,'Day 8 cover and six photographs');
 for(const name of names){const p=manifest.find(x=>x.name===name);assert(p&&p.day===8&&p.providedByUser===true,'Day 8 must use the user photograph '+name);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'Upscaled day 8 photograph');}
}
assert(!fs.existsSync(path.join(root,'photo-credits.html')),'Removed photo page recreated');
for(const file of files)assert(!/photo-credits\.html|Фотографии и лицензии/.test(read(file)),'Removed photo links in '+file);
console.log('All links, IDs, HTML nesting, styles, schedules and local JPEG files verified.');

