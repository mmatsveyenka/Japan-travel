const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-18.cjs')[0];
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'days/day-17.html'))).digest('hex'),'8540e0d6ba4bf062c30bb63f893cb5481cc14c391043d7015917973da1473f92','Previously completed day 17 changed');
assert.equal(d.number,18);assert.equal(d.title,'Токио');assert.equal(d.jp,'東京');assert.equal(d.color,'#26344D');
assert.equal(d.date,'пятница, 28 мая');assert.equal(new Date(Date.UTC(2027,4,28)).getUTCDay(),5);
assert.equal(d.stops.length,12);assert.equal(d.rows.length,12);
const names=['ガシャポンバンダイオフィシャルショップ秋葉原店','秋葉原ラジオ会館','スーパーポテト秋葉原店','まんだらけコンプレックス','ハードオフ秋葉原2号店','駿河屋 秋葉原ゲーム館','BEEP秋葉原店','アニメイト秋葉原','東京水辺ライン 浅草二天門発着場','フジテレビ本社ビル','お台場海浜公園','東京アクアシンフォニー'];
assert.deepEqual(d.stops.map(s=>s.jp),names);assert.deepEqual(d.rows.map(s=>s.jp),names);
assert.deepEqual(d.rows.map(s=>s.cardIndex),Array.from({length:12},(_,i)=>i));
const times=Array(10).fill('днём').concat(['вечер','вечер']);
assert.deepEqual(d.stops.map(s=>s.time),times);assert.deepEqual(d.rows.map(s=>s.time),times);
assert(!d.beforeStops&&!d.stops.some(s=>s.optional||s.duration||s.after),'No additional stops, optionality, durations or transfers');
assert.deepEqual(d.stops.map(s=>s.type),Array(8).fill('culture').concat(['modern','modern','nature','culture']));
assert.deepEqual(d.confirmations,{partsOfDay:'Да, так и оформить',branches:'Да, эти два филиала',cruise:'Да, от Асакусы до Одайбы'});
assert.equal(d.stops[4].address,'東京都千代田区外神田3-8-1 YSビル');
assert.equal(d.stops[5].address,'東京都千代田区外神田3-15-4 2階');
assert.equal(d.stops[6].address,'東京都千代田区神田練塀町15-1 SEEKBASE内3区画');
assert.equal(d.stops[8].address,'東京都台東区花川戸2-1地先');
assert(d.stops[8].en.includes('Asakusa Nitenmon to Odaiba'));
assert.deepEqual(d.stops.map(s=>s.practical),[
 ['10:00–23:00','Бесплатно','—'],['10:00–20:00','Бесплатно','—'],['11:00–20:00','Бесплатно','—'],['12:00–20:00','Бесплатно','—'],
 ['11:00–20:00','Бесплатно','—'],['11:00–21:00','Бесплатно','—'],['12:00–20:00','Бесплатно','—'],['10:00–21:00','Бесплатно','—'],
 ['По рейсам','¥2 000','Не указан'],['По зонам','Не указана','Не указан'],['Без расписания','Бесплатно','—'],['По сеансам','Бесплатно','—']
]);
const notes=[
 '💡 Сотни автоматов с капсульными игрушками — от миниатюр и персонажей аниме до необычных брелоков; магазин расположен на 4-м этаже по адресу Sotokanda 1-15-9.',
 '💡 Многоэтажный комплекс с фигурками, карточками, моделями и коллекционным мерчем; удобно начать здесь прямо у станции.',
 '💡 Ретро-консоли и картриджи от Famicom до PlayStation, редкие игры и ретро-аркадные автоматы на верхнем этаже.',
 '💡 Коллекционные игрушки, старые фигурки, манга и ретро-товары; загляни на этаж с играми, если он открыт в выбранном филиале.',
 '💡 Подержанная электроника, аудиотехника, игровые устройства и секции junk — вещи с дефектами или без полной комплектации',
 '💡 Подержанные игры, диски, картриджи, аксессуары и игровые журналы; стоит сравнить цены с Super Potato.',
 '💡 Ретро-компьютеры, старые японские ПК, платы игровых автоматов и редкие аксессуары. Проверь работу магазина ближе к поездке: информация о его доступности в 2026 году противоречива',
 '💡 Новинки аниме-мерча, манга, диски, канцелярия и товары по текущим популярным сериалам.'
];
for(let i=0;i<notes.length;i++){
 assert.equal(d.stops[i].note,notes[i]);assert.equal(d.rows[i].note,notes[i]);assert(d.stops[i].advice.includes(notes[i]));
}
assert(d.stops[3].advice.join(' ').includes('Complex 2'),'Do not promise the former game floor');
assert(d.stops[6].body.includes('6 июня 2026'),'Preserve the verified BEEP move');
assert(d.coverBrief&&d.stops.every(s=>s.photoBrief),'Thirteen photograph briefs required');
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
 const p=manifest.find(p=>p.name===s.image);assert(p&&p.day===18&&p.providedByUser===true);
 assert.equal(p.stopId,i?'d18-s'+String(i).padStart(2,'0'):'cover');assert.equal(p.alt,s.alt);
 assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
 if(s.userApprovedIllustration){
  assert.equal(p.userApprovedIllustration,true);
  assert.equal(p.userInstruction,'используй эти фотографии и не проси поменять никакую из них');
  assert.equal(s.userInstruction,p.userInstruction);
 }
}
assert.equal(new Set(supplied.map(s=>s.image)).size,supplied.length);
if(d.status==='ready')assert.deepEqual(slots.map((s,i)=>s.userApprovedIllustration?i:null).filter(i=>i!==null),[1,3,4,5,6,7],'Keep explicit user approval on the six agreed illustrations');
if(d.status==='awaiting_photos'){
 assert(supplied.length<13);assert(!fs.existsSync(path.join(root,'days/day-18.html')),'No unfinished HTML');
 assert(!/id="day-18"|href="(?:days\/day-18\.html)?#day-18"/.test(read('index.html')+read('brochure.html')),'No unfinished day activation');
 console.log('OK day 18 preparation; '+supplied.length+' photographs supplied, '+(13-supplied.length)+' awaited.');
}else{
 assert.equal(d.status,'ready');assert.equal(supplied.length,13);
 const html=read('days/day-18.html');assert(html.includes('День 18 · пятница, 28 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),times);
 assert.equal((html.match(/class="stop"/g)||[]).length,12);assert.equal((html.match(/class="optb"/g)||[]).length,0);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 const plan=html.match(/<div class="rows">([\s\S]*?)<\/section>/)[1];
 assert.deepEqual([...plan.matchAll(/<a class="row" href="([^"]+)"/g)].map(m=>m[1]),Array.from({length:12},(_,i)=>'#d18-s'+String(i+1).padStart(2,'0')));
 for(let i=1;i<=12;i++)assert(html.includes('Остановка '+i+' из 12'));
 for(const note of notes)assert.equal(html.split(note).length-1,2,'Note must appear in plan and advice');
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),slots.map(s=>s.image));
 const section=html.match(/<!-- DAY-18 START -->[\s\S]*?<!-- DAY-18 END -->/)[0];
 assert(read('brochure.html').includes(section.replaceAll('../assets/photos/','assets/photos/').replaceAll('../index.html#index','#index')));
}
