const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('../.tmp/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();
const report=[];
for(const width of [320,390,820,1180])for(const n of ['03','04']){
await page.setViewportSize({width,height:1000});await page.goto('file:///E:/japan-travel/days/day-'+n+'.html');
for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(x=>x.decode());}
const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src),ratios:[...document.querySelectorAll('.photo')].map(x=>x.clientWidth/x.clientHeight),find:[...document.querySelectorAll('.find')].map(x=>getComputedStyle(x).marginTop)}));
assert(!data.overflow,`Overflow ${n}/${width}`);assert(!data.broken.length,JSON.stringify(data.broken));assert(data.ratios.every(r=>Math.abs(r-(width>=900?16/9:4/3))<.02));assert(data.find.every(x=>x==='32px'));
await page.locator('.loc summary').first().click();assert(await page.locator('.loc').first().getAttribute('open')!==null);
assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Open address overflow');
await page.locator('.story summary').first().click();assert(await page.locator('.story').first().getAttribute('open')!==null);
report.push({day:n,width,...data});
await page.locator('.loc summary').first().click();await page.locator('.story summary').first().click();
await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`.tmp/day-${n}-${width}-cover.png`});
if(width===820||width===1180)for(let i=0;i<6;i++){const card=page.locator('.stop').nth(i);await card.evaluate(x=>window.scrollTo(0,x.getBoundingClientRect().top+scrollY));await page.screenshot({path:`.tmp/day-${n}-${width}-stop-${i+1}.png`});}
}
await page.goto('file:///E:/japan-travel/index.html');assert.equal(await page.locator('.tile').count(),21);assert.equal(await page.locator('.tile.on').count(),4);
await page.locator('a[href*="day-03"]').click();await page.locator('.plan .row').first().click();assert(page.url().endsWith('#d03-s01'));await page.locator('.back').last().click();assert(page.url().endsWith('index.html#index'));
await page.goto('file:///E:/japan-travel/brochure.html');await page.locator('a.tile[href="#day-04"]').click();assert(page.url().endsWith('#day-04'));assert.equal(await page.locator('.stop').count(),17);
fs.writeFileSync('.tmp/visual-report.json',JSON.stringify(report,null,2));await browser.close();console.log('Phone and iPad layouts, images, disclosures and navigation verified.');
})().catch(e=>{console.error(e);process.exit(1)});

