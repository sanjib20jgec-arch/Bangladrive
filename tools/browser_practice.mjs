// Browser exercise of the optional first-drive practice; start Vite separately.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
});
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => !!window.__gameDebug && !document.querySelector('#boot-screen'), { timeout: 60000 });
  const before = await page.evaluate(() => ({ x: window.__gameDebug.state.x, z: window.__gameDebug.state.z, nitro: window.__gameDebug.state.nitro, money: window.__gameDebug.profile.data.taka, medals: JSON.stringify(window.__gameDebug.profile.data.modeMedals) }));
  await page.click('#guide-practice');
  assert.equal(await page.$eval('#practice-panel', el => !el.classList.contains('hidden')), true);
  assert.equal(await page.evaluate(() => !!window.__gameDebug.scene.getObjectByName('first-drive-practice-checkpoint')), true);
  for (const [key, index] of [['a', 0], ['s', 1], ['Space', 2], ['Shift', 3]]) {
    await page.keyboard.down(key);
    try { await page.waitForFunction(i => document.querySelectorAll('#practice-steps li')[i].textContent.startsWith('✓'), { timeout: 15000 }, index); }
    finally { await page.keyboard.up(key); }
  }
  await page.keyboard.down('w');
  try { await page.waitForFunction(() => document.querySelector('#practice-message').textContent.includes('Practice complete'), { timeout: 60000 }); }
  finally { await page.keyboard.up('w'); }
  const after = await page.evaluate(() => ({ x: window.__gameDebug.state.x, z: window.__gameDebug.state.z, nitro: window.__gameDebug.state.nitro, money: window.__gameDebug.profile.data.taka, medals: JSON.stringify(window.__gameDebug.profile.data.modeMedals), active: window.__gameDebug.modeSession.state.active, marker: !!window.__gameDebug.scene.getObjectByName('first-drive-practice-checkpoint') }));
  assert.ok(Math.abs(after.x - before.x) < .001 && Math.abs(after.z - before.z) < .001, 'practice returns to previous location');
  assert.equal(after.nitro, before.nitro); assert.equal(after.money, before.money); assert.equal(after.medals, before.medals); assert.equal(after.active, false); assert.equal(after.marker, false);
  await page.click('#practice-skip');

  // Repeat the exercise with emulated touch; this is not a physical-device test.
  await page.setViewport({ width: 800, height: 360, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const openPractice = async () => {
    await page.tap('#settings-toggle');
    await page.$eval('#show-first-drive-guide', el => el.scrollIntoView());
    await page.tap('#show-first-drive-guide');
    await page.tap('#guide-practice');
  };
  await openPractice();
  const client = await page.createCDPSession();
  const press = async (selector, done) => {
    const rect = await (await page.$(selector)).boundingBox();
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }] });
    try { await page.waitForFunction(done, { timeout: 60000 }); }
    finally { await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  };
  for (const [selector, index] of [['[data-input="left"]', 0], ['[data-input="brake"]', 1], ['[data-input="handbrake"]', 2], ['[data-input="nitro"]', 3]]) {
    await press(selector, `document.querySelectorAll('#practice-steps li')[${index}].textContent.startsWith('✓')`);
  }
  await press('[data-input="throttle"]', "document.querySelector('#practice-message').textContent.includes('Practice complete')");
  const mobileAfter = await page.evaluate(() => ({ money: window.__gameDebug.profile.data.taka, medals: JSON.stringify(window.__gameDebug.profile.data.modeMedals) }));
  assert.equal(mobileAfter.money, before.money); assert.equal(mobileAfter.medals, before.medals);
  await page.tap('#practice-skip');
  await openPractice();
  await page.tap('#practice-skip');
  assert.match(await page.$eval('#practice-message', el => el.textContent), /Practice skipped/);
  await page.tap('#practice-skip');
  await page.tap('#garage-launch');
  await page.tap('[data-tab="modes"]');
  await page.tap('[data-mode="Delivery"]');
  await page.tap('#garage-close');
  await openPractice(); // An active mission must not be replaced or cancelled.
  assert.match(await page.$eval('#guide-status', el => el.textContent), /Cancel the active mode first/);
  assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.active), true);
  assert.equal(await page.evaluate(() => !!window.__gameDebug.scene.getObjectByName('first-drive-practice-checkpoint')), false);
  assert.deepEqual(errors, []);
  console.log('PRACTICE PASS: keyboard and emulated touch actions/checkpoint, reward-free return, skip and active-mission guard.');
} finally {
  await browser.close();
}
