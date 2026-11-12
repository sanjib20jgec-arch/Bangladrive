// Emulated media preference and touch; does not replace human accessibility review.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:800,height:360,isMobile:true,hasTouch:true});
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});
 await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.tap('#guide-dismiss');
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.reducedMotion),'true');
 assert.equal(await page.evaluate(()=>window.__gameDebug.scene.getObjectByName('driving-particles').visible),false);
 await page.tap('#settings-toggle');assert.equal(await page.$eval('#motion-choice',e=>e.value),'system');
 await page.select('#motion-choice','standard');assert.equal(await page.evaluate(()=>document.documentElement.dataset.reducedMotion),'false');
 assert.equal(await page.evaluate(()=>window.__gameDebug.scene.getObjectByName('driving-particles').visible),true);
 await page.select('#motion-choice','reduced');assert.equal(await page.evaluate(()=>document.documentElement.dataset.reducedMotion),'true');
 await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.tap('#settings-toggle');assert.equal(await page.$eval('#motion-choice',e=>e.value),'reduced');
 await page.select('#motion-choice','system');await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
 await page.waitForFunction(()=>document.documentElement.dataset.reducedMotion==='false');
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await page.waitForFunction(()=>document.documentElement.dataset.reducedMotion==='true');
 await page.tap('#settings-toggle');await page.keyboard.down('w');try{await page.waitForFunction(()=>window.__gameDebug.state.speed>1,{timeout:15000});}finally{await page.keyboard.up('w');}
 assert.deepEqual(errors,[]);console.log('MOTION PASS: system media changes, reduced/standard overrides, persisted choice, particle visibility and driving; emulation only.');
}finally{await browser.close();}
