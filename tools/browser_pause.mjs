// Run against a separately started Vite dev server using an installed Chromium.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] });
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => !!window.__gameDebug && !document.querySelector('#boot-screen'), { timeout: 60000 });
  await page.click('#guide-dismiss');
  await page.click('#garage-launch'); await page.click('[data-tab="modes"]'); await page.click('[data-mode="Delivery"]');
  const elapsed = () => page.evaluate(() => window.__gameDebug.modeSession.state.elapsed);
  const stillPaused = async label => { const before = await elapsed(); await new Promise(resolve => setTimeout(resolve, 1200)); assert.equal(await elapsed(), before, label); };
  await stillPaused('new run must not tick while Garage is open');
  await page.click('#garage-close');
  await page.waitForFunction(() => window.__gameDebug.modeSession.state.elapsed > .2, { timeout: 15000 });
  await page.click('#garage-launch'); await stillPaused('Garage must pause an active run'); await page.click('#garage-close');
  await page.click('#settings-toggle'); await stillPaused('Settings must pause an active run');
  await page.$eval('#pause-game', el => el.scrollIntoView()); await page.click('#pause-game');
  assert.equal(await page.$eval('#pause-overlay', el => !el.classList.contains('hidden')), true);
  await page.keyboard.down('w'); await stillPaused('manual pause must freeze a run'); await page.keyboard.up('w');
  const zBefore = await page.evaluate(() => window.__gameDebug.state.z);
  await page.click('#resume-game');
  const before = await elapsed(); await page.waitForFunction(value => window.__gameDebug.modeSession.state.elapsed > value + .2, { timeout: 15000 }, before);
  assert.ok(Math.abs(await page.evaluate(() => window.__gameDebug.state.z) - zBefore) < .01, 'held input during pause must not become stuck');
  await page.keyboard.down('w'); try { await page.waitForFunction(() => window.__gameDebug.state.speed > .5, { timeout: 15000 }); } finally { await page.keyboard.up('w'); }
  await page.keyboard.press('Escape'); assert.equal(await page.$eval('#pause-overlay', el => !el.classList.contains('hidden')), true);
  await stillPaused('Escape must pause');
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('nativeAppState', { detail: { isActive: false } })));
  await page.keyboard.press('Escape'); // Remove manual pause while native lifecycle remains inactive.
  await stillPaused('native inactivity must still pause after manual resume');
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('nativeAppState', { detail: { isActive: true } })));
  const lifecycleBefore = await elapsed(); await page.waitForFunction(value => window.__gameDebug.modeSession.state.elapsed > value + .2, { timeout: 15000 }, lifecycleBefore);

  await page.setViewport({ width: 800, height: 360, isMobile: true, hasTouch: true });
  await page.waitForFunction(() => !!window.__gameDebug && !document.querySelector('#boot-screen'), { timeout: 60000 });
  await page.tap('#garage-launch'); await page.tap('[data-tab="modes"]'); await page.tap('[data-mode="Delivery"]'); await page.tap('#garage-close');
  await page.waitForFunction(() => window.__gameDebug.modeSession.state.elapsed > .2, { timeout: 15000 });
  await page.tap('#settings-toggle'); await page.$eval('#pause-game', el => el.scrollIntoView()); await page.tap('#pause-game');
  await stillPaused('touch pause must freeze a run'); await page.tap('#resume-game');
  const touchBefore = await elapsed(); await page.waitForFunction(value => window.__gameDebug.modeSession.state.elapsed > value + .2, { timeout: 15000 }, touchBefore);
  assert.deepEqual(errors, []);
  console.log('PAUSE PASS: Garage, Settings, manual keyboard/touch pause, lifecycle isolation, input clearing and resume.');
} finally { await browser.close(); }
