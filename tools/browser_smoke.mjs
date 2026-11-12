// Run against a separately started Vite server. CHROME_PATH may point to an installed Chromium.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
});
const url = process.env.GAME_URL || 'http://127.0.0.1:5173/';
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => !!window.__gameDebug && !document.querySelector('#boot-screen'), { timeout: 60000 });
  assert.equal(await page.$eval('#first-drive-guide', el => !el.classList.contains('hidden')), true, 'first-use guide should appear');
  await page.keyboard.down('w');
  try { await page.waitForFunction(() => window.__gameDebug.state.speed > .5, { timeout: 15000 }); }
  finally { await page.keyboard.up('w'); }
  await page.click('#guide-dismiss');
  assert.equal(await page.$eval('#first-drive-guide', el => el.classList.contains('hidden')), true);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => !!window.__gameDebug && !document.querySelector('#boot-screen'), { timeout: 60000 });
  assert.equal(await page.$eval('#first-drive-guide', el => el.classList.contains('hidden')), true, 'dismissal should survive reload');
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.fonts.check('16px "Noto Sans Bengali"', 'বাংলা')), true);
  assert.equal(await page.evaluate(() => !!window.__gameDebug.scene.getObjectByName('tea-seller') && !!window.__gameDebug.scene.getObjectByName('garage-mechanic')), true);
  const actorStart = await page.evaluate(() => { window.__gameDebug.state.z = 0; return window.__gameDebug.actors[0].x; });
  await page.keyboard.press('e');
  await page.waitForFunction(start => window.__gameDebug.actors[0].x > start + .05, { timeout: 15000 }, actorStart);
  assert.ok(await page.evaluate(() => { const a = window.__gameDebug.actors[0]; const p = a.body.translation(); return Math.abs(p.x - a.mesh.position.x) < 1e-4 && Math.abs(p.z - a.mesh.position.z) < 1e-4; }), 'traffic body must follow its visible mesh after a horn');
  await page.keyboard.down('w');
  await page.waitForFunction(() => window.__gameDebug.state.speed > 1, { timeout: 15000 });
  await page.keyboard.down('ArrowUp');
  await page.keyboard.up('w');
  const speedWithAlias = await page.evaluate(() => window.__gameDebug.state.speed);
  await page.waitForFunction(speed => window.__gameDebug.state.speed > speed + .3, { timeout: 15000 }, speedWithAlias);
  await page.keyboard.up('ArrowUp');
  // Place the car in front of a stationary traffic collider, then drive and reverse using real keys.
  const obstacle = await page.evaluate(() => { const {state, actors} = window.__gameDebug; const a = actors[1]; Object.assign(state, {x:a.x, z:a.z+8, vx:0, vz:0, speed:0, yaw:0}); return {z:a.z}; });
  await new Promise(resolve => setTimeout(resolve, 600)); // Let the kinematic body receive the test placement.
  await page.keyboard.down('w');
  try {
    await page.waitForFunction(z => window.__gameDebug.state.z < z + 4, { timeout: 25000 }, obstacle.z);
    await new Promise(resolve => setTimeout(resolve, 1000));
  } finally { await page.keyboard.up('w'); }
  const stoppedZ = await page.evaluate(() => window.__gameDebug.state.z);
  assert.ok(stoppedZ > obstacle.z + 3.35, 'car must stop outside the traffic collider');
  assert.match(await page.$eval('#collision-feedback', el => el.textContent), /Path blocked/);
  await page.keyboard.down('s');
  try { await page.waitForFunction(z => window.__gameDebug.state.z > z + .75, { timeout: 20000 }, stoppedZ); }
  finally { await page.keyboard.up('s'); }
  await page.waitForFunction(() => !document.querySelector('#collision-feedback').textContent, { timeout: 10000 });
  // Place the car beside a parked traffic collider and verify a turn is blocked until space is available.
  await page.evaluate(() => { const {state, actors} = window.__gameDebug; const a = actors[1]; Object.assign(state, {x:a.x+2.5, z:a.z, vx:0, vz:0, speed:0, yaw:0}); });
  await new Promise(resolve => setTimeout(resolve, 600));
  await page.keyboard.down('d');
  try {
    await page.waitForFunction(() => window.__gameDebug.state.yaw > .47, { timeout: 20000 });
    await new Promise(resolve => setTimeout(resolve, 2500));
    const blockedYaw = await page.evaluate(() => window.__gameDebug.state.yaw);
    assert.ok(blockedYaw < .6, 'rotation should stop before overlapping traffic');
    await page.evaluate(() => { window.__gameDebug.state.x += 3; });
    await page.waitForFunction(yaw => window.__gameDebug.state.yaw > yaw + .2, { timeout: 20000 }, blockedYaw);
  } finally { await page.keyboard.up('d'); }
  // Place the stationary car ahead of the bull and trigger its charge with the horn.
  const bullStart = await page.evaluate(() => { const {state, actors} = window.__gameDebug; const bull = actors.find(a => a.netaji); Object.assign(state, {x:bull.x, z:bull.z+4, vx:0, vz:0, speed:0, yaw:0}); return bull.z; });
  await new Promise(resolve => setTimeout(resolve, 600));
  await page.keyboard.press('e');
  await page.waitForFunction(z => window.__gameDebug.actors.find(a => a.netaji).z > z + .05, { timeout: 15000 }, bullStart);
  const chargedIntoCar = await page.evaluate(async () => {
    const carShape = new window.RAPIER.Cuboid(.86,.48,1.75), rotation = {x:0,y:0,z:0,w:1};
    const end = performance.now() + 3000;
    while (performance.now() < end) {
      const {state, actors} = window.__gameDebug, bull = actors.find(a => a.netaji);
      if (bull.collider.shape.intersectsShape({x:bull.x,y:bull.y,z:bull.z}, rotation, carShape, {x:state.x,y:state.y,z:state.z}, rotation)) return true;
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    return false;
  });
  assert.equal(chargedIntoCar, false, 'charging actor must not overlap the car');

  // Emulated mobile touch; this does not replace physical-device testing.
  await page.setViewport({ width: 800, height: 360, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.tap('#garage-launch');
  await page.tap('details.character-tip summary');
  assert.equal(await page.$eval('details.character-tip', el => el.open), true);
  const content = await page.$('.garage-content');
  const rect = await content.boundingBox();
  const client = await page.createCDPSession();
  const x = rect.x + rect.width / 2, y = rect.y + rect.height - 20;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 16 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await new Promise(resolve => setTimeout(resolve, 300));
  assert.ok(await page.$eval('.garage-content', el => el.scrollTop) > 20, 'garage should scroll by touch');
  await page.tap('[data-tab="modes"]');
  await page.tap('details.character-tip summary');
  await page.tap('[data-mode="Rescue"]');
  assert.equal(await page.$eval('details.character-tip', el => el.open), true, 'open tip should survive a mode update');
  assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.mode), 'Rescue');
  assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.active), true);
  await page.$eval('[data-finish]', el => el.scrollIntoView());
  await page.tap('[data-finish]');
  assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.active), false);
  await page.$eval('[data-mode="Rescue"]', el => el.scrollIntoView());
  await page.tap('[data-mode="Rescue"]');
  assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.active), true);
  await page.tap('#garage-close');
  const gas = await page.$('[data-input="throttle"]');
  const gasRect = await gas.boundingBox();
  assert.ok(gasRect.x >= 0 && gasRect.y >= 0 && gasRect.x + gasRect.width <= 800 && gasRect.y + gasRect.height <= 360, 'gas control must fit landscape viewport');
  const gx = gasRect.x + gasRect.width / 2, gy = gasRect.y + gasRect.height / 2;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: gx - 5, y: gy, id: 1 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: gx - 5, y: gy, id: 1 }, { x: gx + 5, y: gy, id: 2 }] });
  assert.equal(await gas.evaluate(el => el.classList.contains('active')), true);
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: gx + 5, y: gy, id: 2 }] });
  assert.equal(await gas.evaluate(el => el.classList.contains('active')), true, 'second finger keeps the control pressed');
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  assert.equal(await gas.evaluate(el => el.classList.contains('active')), false);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: gx, y: gy, id: 3 }] });
  assert.equal(await gas.evaluate(el => el.classList.contains('active')), true);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.equal(await gas.evaluate(el => el.classList.contains('active')), false, 'blur clears active touch control');
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.tap('#settings-toggle');
  await page.$eval('.recovery-help summary', el => el.scrollIntoView());
  await page.tap('.recovery-help summary');
  await page.$eval('#recover-vehicle', el => el.scrollIntoView());
  const beforeRecovery = await page.evaluate(() => ({ active: window.__gameDebug.modeSession.state.active, medals: JSON.stringify(window.__gameDebug.profile.data.modeMedals), money: window.__gameDebug.profile.data.taka }));
  assert.equal(beforeRecovery.active, true);
  await page.tap('#recover-vehicle');
  const afterRecovery = await page.evaluate(() => ({ active: window.__gameDebug.modeSession.state.active, medals: JSON.stringify(window.__gameDebug.profile.data.modeMedals), money: window.__gameDebug.profile.data.taka, x: window.__gameDebug.state.x, z: window.__gameDebug.state.z, speed: window.__gameDebug.state.speed }));
  assert.equal(afterRecovery.active, false);
  assert.equal(afterRecovery.medals, beforeRecovery.medals);
  assert.equal(afterRecovery.money, beforeRecovery.money);
  assert.ok(Math.abs(afterRecovery.x) <= 4 && afterRecovery.z >= 8 && afterRecovery.z <= 44);
  assert.ok(Math.abs(afterRecovery.speed) < .1);
  assert.match(await page.$eval('#recovery-status', el => el.textContent), /run cancelled/);
  await page.$eval('#show-first-drive-guide', el => el.scrollIntoView());
  await page.tap('#show-first-drive-guide');
  assert.equal(await page.$eval('#first-drive-guide', el => !el.classList.contains('hidden')), true, 'guide can be reopened on touch');
  await page.$eval('#guide-dismiss', el => el.scrollIntoView({block:'nearest'}));
  await page.tap('#guide-dismiss');
  assert.equal(await page.$eval('#first-drive-guide', el => el.classList.contains('hidden')), true);
  await page.tap('#settings-toggle');
  await page.$eval('#control-mode-choice', el => el.scrollIntoView());
  await page.select('#control-mode-choice', 'joystick');
  await page.tap('#settings-toggle');
  const joystick = await page.$('#joystick-base');
  const joyRect = await joystick.boundingBox();
  const jx = joyRect.x + joyRect.width * .8, jy = joyRect.y + joyRect.height * .5;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: jx, y: jy }] });
  assert.notEqual(await page.$eval('#joystick-knob', el => el.style.transform), 'translate(0px, 0px)');
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  assert.equal(await page.$eval('#joystick-knob', el => el.style.transform), 'translate(0px, 0px)');
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.tap('#garage-launch');
  assert.ok(await page.$eval('.garage-content', el => el.clientHeight > 0 && el.scrollHeight > el.clientHeight), 'portrait menu must remain scrollable');
  assert.deepEqual(errors, []);
  console.log('BROWSER SMOKE PASS: desktop boot/keyboard aliases/font/characters; emulated mobile multitouch, blur, menu, scroll, Rescue abort/retry and recovery; portrait layout.');
} finally {
  await browser.close();
}
