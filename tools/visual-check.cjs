const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('../.tmp/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();
const report=[];
const selected=process.argv.slice(2).length?process.argv.slice(2):['03','04','05','06'];
const dayFiles=fs.readdirSync(path.join(__dirname,'../days')).filter(n=>/^day-\d{2}\.html$/.test(n));
const totalStops=dayFiles.reduce((sum,f)=>sum+(fs.readFileSync(path.join(__dirname,'../days',f),'utf8').match(/class="stop"/g)||[]).length,0);
for(const width of [320,390,820,1180])for(const n of selected){
await page.setViewportSize({width,height:1000});await page.goto('file:///E:/japan-travel/days/day-'+n+'.html');
for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(x=>x.decode());}
const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src),ratios:[...document.querySelectorAll('.photo')].map(x=>x.clientWidth/x.clientHeight),find:[...document.querySelectorAll('.find')].map(x=>getComputedStyle(x).marginTop)}));
assert(!data.overflow,`Overflow ${n}/${width}`);assert(!data.broken.length,JSON.stringify(data.broken));assert(data.ratios.every(r=>Math.abs(r-(width>=900?16/9:4/3))<.02));assert(data.find.every(x=>x==='32px'));
for(let i=0;i<await page.locator('.stop').count();i++){
await page.locator('.loc summary').nth(i).click();assert(await page.locator('.loc').nth(i).getAttribute('open')!==null);
assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Open address overflow');
await page.locator('.story summary').nth(i).click();assert(await page.locator('.story').nth(i).getAttribute('open')!==null);
assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Open history overflow');
await page.locator('.loc summary').nth(i).click();await page.locator('.story summary').nth(i).click();
}
report.push({day:n,width,...data});
await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`.tmp/day-${n}-${width}-cover.png`});
if(width===820||width===1180)for(let i=0;i<await page.locator('.stop').count();i++){const card=page.locator('.stop').nth(i);await card.evaluate(x=>window.scrollTo(0,x.getBoundingClientRect().top+scrollY));await page.screenshot({path:`.tmp/day-${n}-${width}-stop-${i+1}.png`});}
}
await page.goto('file:///E:/japan-travel/index.html');assert.equal(await page.locator('.tile').count(),21);assert.equal(await page.locator('.tile.on').count(),dayFiles.length);
for(const n of selected){
await page.goto('file:///E:/japan-travel/index.html');await page.locator('a[href*="day-'+n+'"]').click();
const last=await page.locator('.plan a.row').last().getAttribute('href');await page.locator('.plan a.row').last().click();assert(page.url().endsWith(last));
await page.locator('.back').last().click();assert(page.url().endsWith('index.html#index'));
await page.goto('file:///E:/japan-travel/brochure.html');await page.locator('a.tile[href="#day-'+n+'"]').click();assert(page.url().endsWith('#day-'+n));assert.equal(await page.locator('.stop').count(),totalStops);
const first=await page.locator('#d'+n+'-plan a.row').first().getAttribute('href');await page.locator('#d'+n+'-plan a.row').first().click();assert(page.url().endsWith(first));
await page.locator('#day-'+n+' .back').last().click();assert(page.url().endsWith('#index'));
}
fs.writeFileSync('.tmp/visual-report-'+selected.join('-')+'.json',JSON.stringify(report,null,2));await browser.close();console.log('Phone and iPad layouts, images, disclosures and navigation verified.');
})().catch(e=>{console.error(e);process.exit(1)});

