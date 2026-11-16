const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dayFiles=fs.readdirSync(path.join(root,'days')).filter(n=>/^day-\d{2}\.html$/.test(n)).sort().map(n=>'days/'+n);
const files=['index.html','brochure.html',...dayFiles,'reference.html'];
const sourceCss=fs.readFileSync(path.join(root,'reference.html'),'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
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
const approved={'days/day-01.html':'b9e08843b90af8eb3128a4efe3aa4c2da93ea22fef68b5a0f5a80657e5e47c5e','days/day-02.html':'dadc37535717ca2641f49f5a3617d9444913027c96e094ed0660d11ce69ef890','reference.html':'98296ed25bfd0791cb55f9f8cf5e186e222693c39d1e697b6ed712c825535903'};
approved['days/day-08.html']='aa6dc0e79b22a5012ddf89acceeba592438285984909254aaf84fed8bfdf8588';
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
assert.equal(require('node:crypto').createHash('sha256').update(seventh).digest('hex'),'147da78a2ddadc41faf3be077ecee29fa83a571f43ede3a688a2ef64b68e658f','Prior day 7 changed');
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
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'days/day-06.html'))).digest('hex'),'85ce1e4ebb8b0861f9b3fd857f8dd2fd424999812c2a23af0ddfa1437f2a2b67','Prior day 6 changed');
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
for(const [file,hash] of Object.entries({'days/day-03.html':'7af45ad8e45c262b94feef20a3bc0dc8b99833b029ddc97d01110327c619b1a9','days/day-04.html':'db7bfada80b7eb58adc4ab1f9223a31b7aee498bf4305031106820bda6584b41','days/day-05.html':'405cddad27a11594ad854d7ab40a52a1b5b7330d5f3f3883db1770cdafb8e937'}))assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Prior day changed: '+file);
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

