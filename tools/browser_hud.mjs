// Emulated viewport and persistence check; not a real-device readability audit.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const vp of [{width:800,height:360,isMobile:true,hasTouch:true},{width:360,height:800,isMobile:true,hasTouch:true},{width:640,height:320,isMobile:true,hasTouch:true}]){
  await page.setViewport(vp);await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
  if(await page.$eval('#first-drive-guide',el=>!el.classList.contains('hidden')))await page.tap('#guide-dismiss');
  await page.tap('#settings-toggle');await page.select('#hud-size-choice','standard');const normalSize=await page.$eval('#mode-status-hud',el=>parseFloat(getComputedStyle(el).fontSize));await page.select('#hud-size-choice','large');
  assert.ok(await page.$eval('#mode-status-hud',el=>parseFloat(getComputedStyle(el).fontSize))>normalSize);await page.tap('#settings-toggle');
  await page.tap('#garage-launch');await page.tap('[data-tab="modes"]');await page.$eval('[data-mode="Rescue"]',el=>el.scrollIntoView());await page.tap('[data-mode="Rescue"]');await page.tap('#garage-close');
  await page.waitForFunction(()=>document.querySelector('#mode-status-hud').textContent.includes('RESCUE'));
  await page.evaluate(async()=>{const {EventBus}=await import('/src/core/EventBus.js');EventBus.emit('droneRelay',{index:3,total:3,activated:true,relaysActivated:3});});
  assert.match(await page.$eval('#combo',el=>el.textContent),/SHAPLA RELAY/);
  const boxes=await page.evaluate(()=>{const selectors=['.brand','.speed','.combo','#mode-status-hud','#settings-toggle','#garage-launch','[data-input="throttle"]','[data-input="left"]'];const result={};for(const sel of selectors){const r=document.querySelector(sel).getBoundingClientRect();result[sel]={x:r.x,y:r.y,right:r.right,bottom:r.bottom};}return result;});
  const overlaps=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
  for(const [sel,r] of Object.entries(boxes))assert.ok(r.x>=0&&r.y>=0&&r.right<=vp.width&&r.bottom<=vp.height,`${vp.width}×${vp.height} ${sel} out of bounds ${JSON.stringify(r)}`);
  assert.ok(!overlaps(boxes['.brand'],boxes['.speed'])&&!overlaps(boxes['.brand'],boxes['.combo']),'header text should not overlap');
  assert.ok(!overlaps(boxes['#settings-toggle'],boxes['.speed'])&&!overlaps(boxes['#settings-toggle'],boxes['.combo']),'settings must not cover readouts');
  assert.ok(!overlaps(boxes['#mode-status-hud'],boxes['#garage-launch'])&&!overlaps(boxes['#mode-status-hud'],boxes['#settings-toggle']),'mission text should not overlap menu buttons');
  assert.ok(!overlaps(boxes['#mode-status-hud'],boxes['[data-input="throttle"]'])&&!overlaps(boxes['#mode-status-hud'],boxes['[data-input="left"]']),'mission text should not overlap driving buttons');
  await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>!!window.__gameDebug&&!document.querySelector('#boot-screen'),{timeout:60000});
  assert.equal(await page.$eval('#hud-root',el=>el.dataset.hudSize),'large');
  await page.tap('#settings-toggle');await page.select('#hud-size-choice','standard');assert.equal(await page.$eval('#hud-root',el=>el.dataset.hudSize),'standard');await page.tap('#settings-toggle');
 }
 assert.deepEqual(errors,[]);console.log('HUD PASS: larger readout, persistence, basic geometry and active Rescue in three emulated viewports; real device/readability untested.');
}finally{await browser.close();}
