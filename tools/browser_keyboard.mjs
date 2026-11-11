// Keyboard-only interaction spot-check in Chromium, not a full accessibility audit.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:1280,height:720});await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});
 await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 const tabUntil=async(selector,max=45)=>{for(let i=0;i<max;i++){if(await page.evaluate(s=>document.activeElement?.matches(s),selector))return;await page.keyboard.press('Tab');}throw Error(`Could not tab to ${selector}`);};
 await tabUntil('#guide-dismiss');await page.keyboard.press('Enter');await tabUntil('#garage-launch');await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'garage-close');
 await tabUntil('[data-tab="modes"]');await page.keyboard.press('Enter');
 assert.equal(await page.$eval('[data-tab="modes"]',el=>el.getAttribute('aria-pressed')),'true');
 await tabUntil('[data-mode="Rescue"]');await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.mode),'Rescue','mode selection should retain focus after rerender');
 assert.equal(await page.evaluate(()=>window.__gameDebug.modeSession.state.active),true);
 await tabUntil('[data-finish]');await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.tab),'modes','disabled cancel button should fall back to active section');
 assert.equal(await page.evaluate(()=>window.__gameDebug.modeSession.state.active),false);
 await page.evaluate(()=>window.__gameDebug.profile.addTaka(900)); // Fixture setup; all menu interaction below uses keyboard.
 await tabUntil('[data-tab="garage"]');await page.keyboard.press('Enter');await tabUntil('[data-vehicle="tin-chaka"]');await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>window.__gameDebug.profile.data.selectedVehicle),'tin-chaka');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.tab),'garage','unlocked and selected disabled vehicle falls back to section');
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'game-canvas');
 await page.keyboard.down('w');try{await page.waitForFunction(()=>window.__gameDebug.state.speed>1,{timeout:15000});}finally{await page.keyboard.up('w');}
 assert.deepEqual(errors,[]);console.log('KEYBOARD PASS: Garage open, tab, mode select/cancel focus and Escape-to-drive; not a screen-reader or device audit.');
}finally{await browser.close();}
