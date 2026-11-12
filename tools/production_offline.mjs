// After build, run against Vite preview. Tests network loss after boot, not an offline-installable PWA.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const url=process.env.GAME_URL||'http://127.0.0.1:4173/',origin=new URL(url).origin;
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage(),external=[],errors=[],unexpectedFailures=[],blocked=[];let checkingOfflineReload=false,blockNetwork=false;
 await page.setRequestInterception(true);
 page.on('request',request=>{const u=new URL(request.url()),http=['http:','https:'].includes(u.protocol);if(http&&u.origin!==origin)external.push(request.url());if(http&&blockNetwork){blocked.push(request.url());request.abort('internetdisconnected');}else request.continue();});
 page.on('requestfailed',request=>{if(!checkingOfflineReload)unexpectedFailures.push(`${request.url()}: ${request.failure()?.errorText}`);});
 page.on('pageerror',error=>errors.push(error.message));
 await page.setCacheEnabled(false);await page.setViewport({width:1280,height:720});
 await page.goto(url,{waitUntil:'networkidle0'});await page.waitForFunction(()=>!!document.querySelector('#garage-launch')&&!document.querySelector('#boot-screen'),{timeout:60000});
 assert.equal(await page.evaluate(()=>('__gameDebug' in window)),false,'must test production build');
 await page.evaluate(()=>document.fonts.ready);await page.click('#guide-dismiss');
 // Avoid involving external browser/OS speech providers in this test.
 await page.click('#settings-toggle');await page.click('#voice-choice');await page.click('#settings-toggle');
 await page.setOfflineMode(true);blockNetwork=true;
 await page.click('#settings-toggle');await page.select('#motion-choice','reduced');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bangladrive_save_v6')).settings.motion),'reduced');
 await page.click('#settings-toggle');await page.click('#garage-launch');await page.click('[data-tab="modes"]');await page.click('[data-mode="Rescue"]');await page.click('#garage-close');
 await page.keyboard.down('w');try{await page.waitForFunction(()=>Number(document.querySelector('#speed').textContent)>1,{timeout:15000});}finally{await page.keyboard.up('w');}
 await page.click('#garage-launch');await page.click('[data-finish]');
 assert.match(await page.$eval('#mode-announcement',el=>el.textContent),/cancelled; no mission reward/);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bangladrive_save_v6')).settings.motion),'reduced');
 assert.deepEqual(blocked,[],'tested gameplay should not require HTTP after boot');
 // The web build has no offline installation mechanism: an uncached reload needs its server.
 checkingOfflineReload=true;let reloadFailed=false;try{await page.reload({waitUntil:'load',timeout:15000});}catch{reloadFailed=true;}checkingOfflineReload=false;
 assert.ok(blocked.some(address=>address.startsWith(origin)), 'reload must attempt to reach its origin');
 const reloadHasGame=reloadFailed?false:await page.evaluate(()=>!!document.querySelector('#game-canvas'));
 assert.equal(reloadHasGame,false,'offline reload must not be mistaken for a playable game');
 blockNetwork=false;await page.setOfflineMode(false);await page.goto(url,{waitUntil:'networkidle0'});await page.waitForFunction(()=>!!document.querySelector('#garage-launch')&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.click('#settings-toggle');assert.equal(await page.$eval('#motion-choice',el=>el.value),'reduced');assert.equal(await page.$eval('#voice-choice',el=>el.checked),false);
 assert.deepEqual(errors,[]);assert.deepEqual(unexpectedFailures,[]);assert.deepEqual(external,[]);
 console.log('OFFLINE PASS: production game continued and saved after network loss; uncached offline reload failed as expected; saved settings restored online. Native, speech and other flows not tested.');
}finally{await browser.close();}
