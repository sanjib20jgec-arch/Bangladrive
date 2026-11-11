// Event injection exercises the real HUD and paused fixed loop; not a human playtest.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.click('#guide-dismiss');
 await page.evaluate(async()=>{const {EventBus}=await import('/src/core/EventBus.js');EventBus.emit('styleAction',{points:350});EventBus.emit('deliveryCheckpoint',{checkpoint:1,total:3});});
 assert.match(await page.$eval('#combo',e=>e.textContent),/DELIVERY CHECKPOINT/);
 await page.click('#settings-toggle');await new Promise(resolve=>setTimeout(resolve,3000));
 assert.match(await page.$eval('#combo',e=>e.textContent),/DELIVERY CHECKPOINT/,'paused time should not expire the notice');
 await page.click('#settings-toggle');
 await page.waitForFunction(()=>document.querySelector('#combo').textContent.includes('350'),{timeout:15000});
 assert.equal(await page.$eval('#combo',e=>e.classList.contains('active')),false);
 await page.waitForFunction(()=>document.querySelector('#combo').textContent.includes('STYLE · 0'),{timeout:15000});
 assert.deepEqual(errors,[]);console.log('COMBO PASS: event notice, pause-safe lifetime, restored latest combo and expiry; injected events.');
}finally{await browser.close();}
