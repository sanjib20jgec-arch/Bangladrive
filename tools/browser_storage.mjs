// Storage fault injection in Chromium; not native/device validation.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try {
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluateOnNewDocument(()=>Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Denied','SecurityError');}}));
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});
 await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.click('#guide-dismiss');await page.keyboard.down('w');try{await page.waitForFunction(()=>window.__gameDebug.state.speed>1,{timeout:15000});}finally{await page.keyboard.up('w');}
 await page.click('#settings-toggle');assert.equal(await page.$eval('#voice-choice',e=>e.checked),true);await page.click('#voice-choice');
 assert.deepEqual(errors,[]);
 const protectedPage=await browser.newPage();const protectedErrors=[];protectedPage.on('pageerror',e=>protectedErrors.push(e.message));
 const url=process.env.GAME_URL||'http://127.0.0.1:5173/';
 await protectedPage.goto(url,{waitUntil:'networkidle0'});
 await protectedPage.evaluate(()=>localStorage.setItem('bangladrive_save_v6','{"version":99,"taka":987}'));
 await protectedPage.reload({waitUntil:'networkidle0'});await protectedPage.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 assert.match(await protectedPage.$eval('#save-warning',e=>e.textContent),/Progress not saving/);
 await protectedPage.click('#settings-toggle');await protectedPage.$eval('.save-help summary',e=>e.scrollIntoView());await protectedPage.click('.save-help summary');
 await protectedPage.$eval('#voice-choice',e=>e.scrollIntoView());await protectedPage.click('#voice-choice');
 assert.equal(await protectedPage.evaluate(()=>localStorage.getItem('bangladrive_save_v6')),'{"version":99,"taka":987}');
 await protectedPage.$eval('#show-saved-data',e=>e.scrollIntoView());await protectedPage.click('#show-saved-data');assert.equal(await protectedPage.$eval('#saved-data',e=>e.value),'{"version":99,"taka":987}');
 assert.equal(await protectedPage.$eval('#replace-save',e=>e.disabled),true);
 await protectedPage.$eval('#replace-save-confirm',e=>e.scrollIntoView());await protectedPage.click('#replace-save-confirm');await protectedPage.click('#replace-save');
 assert.equal(await protectedPage.evaluate(()=>JSON.parse(localStorage.getItem('bangladrive_save_v6')).version),7);
 assert.equal(await protectedPage.$eval('#save-warning',e=>e.classList.contains('hidden')),true);assert.deepEqual(protectedErrors,[]);
 const mirrorUi=await protectedPage.evaluate(async()=>{const {ProfileSaveNotice}=await import('/src/ui/ProfileSaveNotice.js');const {EventBus}=await import('/src/core/EventBus.js');const root=document.createElement('div'),settings=document.createElement('div'),mirror={state:'ready'};document.body.append(root,settings);const notice=new ProfileSaveNotice(root,settings,{saveState:'ok',protectedSave:false},mirror);mirror.state='conflict';EventBus.emit('nativeMirrorStateChanged','conflict');const result={warning:root.textContent,detail:settings.textContent};notice.dispose();root.remove();settings.remove();return result;});
 assert.match(mirrorUi.warning,/Android mirror issue/);assert.match(mirrorUi.detail,/Android saves differ/);
 console.log('STORAGE PASS: denied getter, boot/driving, protected future save, explicit copy and replacement; native persistence unverified.');
} finally {await browser.close();}
