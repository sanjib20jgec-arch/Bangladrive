// Speech is mocked: validates wiring, not actual browser/native voice playback.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluateOnNewDocument(()=>{
   window.speechCalls=[];
   Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){window.speechCalls.push('cancel');},speak(u){window.speechCalls.push(u.text);}}});
   window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
 });
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});
 await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.click('#guide-dismiss');await page.click('#settings-toggle');
 assert.equal(await page.$eval('#voice-choice',e=>e.checked),true);
 await page.click('#voice-choice');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bangladrive_save_v6')).settings.voice),false);
 assert.ok(await page.evaluate(()=>window.speechCalls.includes('cancel')),'muting should cancel ongoing speech');
 assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('muted test')),false);
 await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
 await page.click('#settings-toggle');assert.equal(await page.$eval('#voice-choice',e=>e.checked),false,'mute persists across reload');
 assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('still muted')),false);
 await page.click('#voice-choice');assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('paused test')),false,'Settings pauses speech');
 await page.click('#settings-toggle');assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('unmuted test')),true);
 assert.ok(await page.evaluate(()=>window.speechCalls.includes('unmuted test')));
 const cancels=()=>page.evaluate(()=>window.speechCalls.filter(call=>call==='cancel').length);
 let before=await cancels();await page.click('#garage-launch');assert.ok((await cancels())>before,'Garage pauses speech');assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('garage paused')),false);await page.click('#garage-close');
 before=await cancels();await page.keyboard.press('Escape');assert.ok((await cancels())>before,'manual pause cancels speech');assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('manual paused')),false);await page.click('#resume-game');
 before=await cancels();await page.evaluate(()=>document.dispatchEvent(new CustomEvent('nativeAppState',{detail:{isActive:false}})));assert.ok((await cancels())>before,'native inactivity cancels speech');assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('inactive')),false);
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('nativeAppState',{detail:{isActive:true}})));await new Promise(resolve=>setTimeout(resolve,900));assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('after resume')),true);
 before=await cancels();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.ok((await cancels())>before,'hidden page cancels speech');assert.equal(await page.evaluate(()=>window.__nativeBridge.speak('hidden')),false);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 assert.deepEqual(errors,[]);console.log('VOICE PASS: mocked speech, mute/persistence and menu, manual and simulated lifecycle pause; native audio unverified.');
}finally{await browser.close();}
