// Verifies live-region DOM updates, not an actual screen-reader audit.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader']});
try {
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.click('#guide-dismiss');await page.click('#garage-launch');await page.click('[data-tab="modes"]');await page.click('[data-mode="Rescue"]');
 const announcement=()=>page.$eval('#mode-announcement',el=>el.textContent);
 assert.match(await announcement(),/Rescue selected/);assert.equal(await page.$eval('#mode-announcement',el=>el.getAttribute('aria-live')),'polite');
 await page.click('#garage-close');await page.keyboard.down('w');
 try{await page.waitForFunction(()=>document.querySelector('#mode-announcement').textContent.includes('Parcel 1 of 3 collected'),{timeout:50000});}
 finally{await page.keyboard.up('w');}
 const text=await announcement();await new Promise(resolve=>setTimeout(resolve,1200));assert.equal(await announcement(),text,'live region must not update every HUD frame');
 await page.click('#garage-launch');await page.click('[data-finish]');assert.match(await announcement(),/Rescue cancelled; no mission reward/);
 assert.deepEqual(errors,[]);console.log('ANNOUNCEMENTS PASS: actual Rescue start, checkpoint and cancel live-region updates; no screen reader tested.');
}finally{await browser.close();}
