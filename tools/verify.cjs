const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dayFiles=fs.readdirSync(path.join(root,'days')).filter(n=>/^day-\d{2}\.html$/.test(n)).sort().map(n=>'days/'+n);
const files=['index.html','brochure.html',...dayFiles,'reference.html'];
const sourceCss=fs.readFileSync(path.join(root,'reference.html'),'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const approved={'days/day-01.html':'b9e08843b90af8eb3128a4efe3aa4c2da93ea22fef68b5a0f5a80657e5e47c5e','days/day-02.html':'12d744f38d5348257dc0c97eecdbbc4c90e50d116abbffb1fbc0ede35087596a','reference.html':'2616e69fc91f77c3dd7bc707ebb4160acaf67dde6db320abe01fd5bf48370dd7'};
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
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'days/day-06.html'))).digest('hex'),'167a38b57bcdffce3077ee4df96be360ea7c11b2655a831a216b02fe99b2c854','Prior day 6 changed');
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
for(const [file,hash] of Object.entries({'days/day-03.html':'635711809ec9688030bf9b2d167054ae55ee8bb05bc8c8c03c2119499d2d2dc6','days/day-04.html':'ed1967c60150d4906f53ac6bc49f12ac5d189991c4b2136d11109a7f00876c9b','days/day-05.html':'cb6c49e473af4fa8137c109e6ef2f83dd9ebdb185a4753b5c36f2b0b3317c715'}))assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Prior day changed: '+file);
for(const file of dayFiles){const nn=file.match(/day-(\d+)/)[1],section=read(file).match(new RegExp('<!-- DAY-'+nn+' START -->[\\s\\S]*?<!-- DAY-'+nn+' END -->'))[0];assert(read('brochure.html').includes(rootPaths(section).replaceAll('index.html#index','#index')),'Combined day differs '+nn);}
const usedPhotos=dayFiles.flatMap(f=>[...read(f).matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]));assert.equal(new Set(usedPhotos).size,usedPhotos.length,'Repeated photograph in itinerary');
for(const file of fs.readdirSync(path.join(root,'assets/photos'))){const b=fs.readFileSync(path.join(root,'assets/photos',file));assert.equal(b.readUInt16BE(0),0xffd8,'Not JPEG '+file);}

const manifest=JSON.parse(read('tools/photo-manifest.json'));
const day7Photos=[...seventh.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]);
assert.equal(day7Photos.length,9,'Day 7 cover and eight stop images');
for(const name of day7Photos){const p=manifest.find(x=>x.name===name);assert(p,'Day 7 photo missing from manifest: '+name);assert.equal(p.day,7);assert(p.providedByUser===true||typeof p.attributionRequired==='boolean','Missing photo provenance: '+name);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'Upscaled photograph '+name);}
assert(!fs.existsSync(path.join(root,'photo-credits.html')),'Removed photo page recreated');
for(const file of files)assert(!/photo-credits\.html|Фотографии и лицензии/.test(read(file)),'Removed photo links in '+file);
console.log('All links, IDs, HTML nesting, styles, schedules and local JPEG files verified.');

