// Geometry and touch interaction spot-check, not a physical-device ergonomics audit.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try {
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for (const viewport of [{width:800,height:360,isMobile:true,hasTouch:true},{width:360,height:800,isMobile:true,hasTouch:true},{width:640,height:320,isMobile:true,hasTouch:true}]){
  await page.setViewport(viewport);await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
  if(await page.$eval('#first-drive-guide',el=>!el.classList.contains('hidden')))await page.tap('#guide-dismiss');
  const check=async selector=>{const sizes=await page.$$eval(selector,els=>els.filter(el=>!el.closest('.hidden')).map(el=>({name:el.id||el.dataset.tab||el.dataset.mode||el.textContent.trim().slice(0,35),width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})));assert.ok(sizes.length,`no matching targets: ${selector}`);for(const size of sizes)assert.ok(size.width>=48&&size.height>=48,`${viewport.width}×${viewport.height} ${size.name}: ${size.width}×${size.height}`);};
  await check('#garage-launch,#settings-toggle');await page.tap('#garage-launch');
  await check('.garage-overlay button,.garage-content summary');
  await page.tap('[data-tab="modes"]');await check('.garage-overlay button,.garage-content summary');
  await page.$eval('[data-mode="Rescue"]',el=>el.scrollIntoView());await page.tap('[data-mode="Rescue"]');
  assert.equal(await page.evaluate(()=>window.__gameDebug.modeSession.state.active),true);
  await page.$eval('[data-finish]',el=>el.scrollIntoView());await page.tap('[data-finish]');await page.tap('#garage-close');
  await page.tap('#settings-toggle');await check('#settings-panel button,#settings-panel select,#settings-panel summary,#settings-panel .toggle-setting');
  await page.$eval('#voice-choice',el=>el.closest('label').scrollIntoView());const before=await page.$eval('#voice-choice',el=>el.checked);
  await page.tap('label.toggle-setting:has(#voice-choice)');assert.equal(await page.$eval('#voice-choice',el=>el.checked),!before,'tapping the enlarged label toggles the checkbox');
  await page.tap('#settings-toggle');
 }
 assert.deepEqual(errors,[]);console.log('TARGETS PASS: CSS target dimensions and touch interaction in three emulated viewports; physical device untested.');
}finally{await browser.close();}
