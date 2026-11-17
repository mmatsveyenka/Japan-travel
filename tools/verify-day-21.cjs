const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const d=require('./day-21.cjs')[0];
assert.equal(d.number,21);assert.equal(d.date,'понедельник, 31 мая');
assert.equal(new Date(Date.UTC(2027,4,31)).getUTCDay(),1);
assert.equal(d.title,'Токио');assert.equal(d.jp,'東京');assert.equal(d.color,'#26344D');
assert.equal(d.stops.length,0,'Departure day has no sightseeing stops');
assert.equal(d.rows.length,1,'Untimed flight follows transfer in its note');
assert.equal(d.rows[0].time,'8:30','User correction supersedes 6:56');
assert.equal(d.rows[0].name,'T-CAT → Ханэда, терминал 3');
assert.equal(d.rows[0].jp,'東京シティエアターミナル → 羽田空港第3ターミナル');
assert.equal(d.rows[0].ch,'Shuttle Bus или метро');
assert.equal(d.rows[0].note,'Затем вылетаем домой.');
assert(!d.beforeStops&&!d.rows.some(s=>s.id||s.cardIndex!==undefined||s.optional||s.duration||s.after));
assert.equal(d.research.flightTime,null);assert.equal(d.research.confirmedForVisit,false);
assert.equal(d.research.visit,'2027-05-31');assert(d.coverBrief);
if(d.cover===null)assert.equal(d.coverAlt,null);
else{
 assert(typeof d.cover==='string'&&d.cover&&d.coverAlt);
 assert(fs.existsSync(path.join(root,'assets/photos',d.cover)));
 const p=JSON.parse(read('tools/photo-manifest.json')).find(p=>p.name===d.cover);
 assert(p&&p.day===21&&p.stopId==='cover'&&p.providedByUser===true);
 assert.equal(p.alt,d.coverAlt);assert(p.outputWidth<=p.width&&p.outputHeight<=p.height,'No upscaling');
}
if(d.status==='awaiting_photos'){
 assert.equal(d.cover,null,'Only one photograph is needed');
 assert(!fs.existsSync(path.join(root,'days/day-21.html')),'No unfinished page');
 assert(!/id="day-21"|href="(?:days\/day-21\.html)?#day-21"/.test(read('index.html')+read('brochure.html')),'No unfinished activation');
 console.log('OK day 21 preparation; one user cover photograph awaited.');
}else{
 assert.equal(d.status,'ready');assert(d.cover&&d.coverAlt);
 const html=read('days/day-21.html');
 assert(html.includes('День 21 · понедельник, 31 мая'));
 assert.deepEqual([...html.matchAll(/class="tm(?: g)?">([^<]+)</g)].map(m=>m[1]),['8:30']);
 assert(!/6:56|class="(?:stop|practical|loc|story|optb|ar)"|<a class="row"/.test(html));
 assert(html.includes(d.rows[0].name)&&html.includes(d.rows[0].jp));
 assert(html.includes(d.rows[0].ch)&&html.includes(d.rows[0].note));
 assert.equal((html.match(/class="row"/g)||[]).length,1);
 assert.equal((html.match(/class="back"/g)||[]).length,2);
 assert.deepEqual([...html.matchAll(/src="\.\.\/assets\/photos\/([^"]+)"/g)].map(m=>m[1]),[d.cover]);
 assert(!/<img[^>]+loading="lazy"/.test(html),'Cover loads immediately');
 const section=html.match(/<!-- DAY-21 START -->[\s\S]*?<!-- DAY-21 END -->/)[0];
 assert(read('brochure.html').includes(section.replaceAll('../assets/photos/','assets/photos/').replaceAll('../index.html#index','#index')));
 assert(read('index.html').includes('href="days/day-21.html#day-21"'));
 console.log('OK day 21 departure page and combined copy.');
}
