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
for(const file of dayFiles){const nn=file.match(/day-(\d+)/)[1],section=read(file).match(new RegExp('<!-- DAY-'+nn+' START -->[\\s\\S]*?<!-- DAY-'+nn+' END -->'))[0];assert(read('brochure.html').includes(rootPaths(section).replaceAll('index.html#index','#index')),'Combined day differs '+nn);}
const usedPhotos=dayFiles.flatMap(f=>[...read(f).matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]));assert.equal(new Set(usedPhotos).size,usedPhotos.length,'Repeated photograph in itinerary');
for(const file of fs.readdirSync(path.join(root,'assets/photos'))){const b=fs.readFileSync(path.join(root,'assets/photos',file));assert.equal(b.readUInt16BE(0),0xffd8,'Not JPEG '+file);}
console.log('All links, IDs, HTML nesting, styles, schedules and local JPEG files verified.');
