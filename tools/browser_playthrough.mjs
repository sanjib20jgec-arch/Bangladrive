// Automated straight-road keyboard playthrough; requires a running Vite server and Chromium.
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
  for (const mode of ['Delivery', 'Rescue', 'Drone Delivery']) {
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => !!window.__gameDebug && !document.querySelector('#boot-screen'), { timeout: 60000 });
    await page.click('#garage-launch');
    await page.click('[data-tab="modes"]');
    await page.click(`[data-mode="${mode}"]`);
    await page.click('#garage-close');
    await page.waitForFunction(mode => window.__gameDebug.modeSession.state.mode === mode && !window.__gameDebug.modeSession.state.justStarted, {}, mode);
    if (mode !== 'Delivery') assert.equal(await page.evaluate(() => window.__gameDebug.objectiveMarkers.pickups.length), 3);
    await page.keyboard.down('w');
    try {
      await page.waitForFunction(() => !window.__gameDebug.modeSession.state.active, { timeout: 150000 });
    } finally {
      await page.keyboard.up('w');
    }
    const result = await page.evaluate(() => {
      const s = window.__gameDebug.modeSession.state;
      return { mode: s.mode, outcome: s.outcome, reason: s.reason, distance: s.distance, elapsed: s.elapsed, checkpoints: s.checkpoints, rescued: s.rescued, relays: s.relaysActivated, result: s.lastResult };
    });
    console.log('RUN', JSON.stringify(result));
    assert.equal(result.outcome, 'success', `${mode} should complete on the straight road`);
    assert.match(await page.$eval('#mode-announcement', el => el.textContent), /Complete/);
    if (mode === 'Rescue') assert.equal(result.rescued, 3);
    if (mode === 'Drone Delivery') assert.equal(result.relays, 3);
    await page.waitForFunction(() => document.querySelector('#mode-status-hud').textContent.includes('সম্পন্ন'), { timeout: 10000 });
    await page.click('#garage-launch');
    await page.waitForFunction(() => document.querySelector('.mode-status').textContent.includes('সম্পন্ন'));
    await page.click(`[data-mode="${mode}"]`);
    assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.active), true);
    await page.click('[data-finish]');
    assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.active), false);
    assert.equal(await page.evaluate(() => window.__gameDebug.modeSession.state.lastResult), null);
    console.log('RETRY/ABORT PASS', mode);
  }
  assert.deepEqual(errors, []);
  console.log('PLAYTHROUGH PASS: keyboard Delivery, Rescue and Relay completion, result display, retry and abort; no page/console errors.');
} finally {
  await browser.close();
}
