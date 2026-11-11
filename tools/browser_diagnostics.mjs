// Run against a separately started Vite dev server; emulated touch is not a device benchmark.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const url = process.env.GAME_URL || 'http://127.0.0.1:5173/';
const origin = new URL(url).origin, errors = [], external = [];
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { const u = new URL(request.url()); if (['http:', 'https:'].includes(u.protocol) && u.origin !== origin) external.push(request.url()); });
  await page.setViewport({ width: 800, height: 360, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => !!window.__gameDebug && !document.querySelector('#boot-screen'), { timeout: 60000 });
  await page.tap('#guide-dismiss');
  const storageBefore = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
  await page.tap('#settings-toggle');
  await page.$eval('.frame-diagnostics summary', el => el.scrollIntoView()); await page.tap('.frame-diagnostics summary');
  await page.$eval('#diagnostics-start', el => el.scrollIntoView()); await page.tap('#diagnostics-start');
  await new Promise(resolve => setTimeout(resolve, 1200));
  await page.$eval('#diagnostics-stop', el => el.scrollIntoView()); await page.tap('#diagnostics-stop');
  assert.match(await page.$eval('#diagnostics-status', el => el.textContent), /No frames sampled/);
  await page.$eval('#diagnostics-device', el => el.scrollIntoView()); await page.type('#diagnostics-device', 'Test browser only');
  await page.tap('#diagnostics-start'); await page.tap('#settings-toggle');
  const gas = await (await page.$('[data-input="throttle"]')).boundingBox(); const client = await page.createCDPSession();
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: gas.x + gas.width / 2, y: gas.y + gas.height / 2 }] });
  try { await page.waitForFunction(() => window.__gameDebug.state.speed > 2, { timeout: 15000 }); await new Promise(resolve => setTimeout(resolve, 1800)); }
  finally { await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  await page.tap('#settings-toggle'); await page.$eval('#diagnostics-stop', el => el.scrollIntoView()); await page.tap('#diagnostics-stop');
  const report = await page.$eval('#diagnostics-report', el => el.value);
  assert.match(report, /Device \(entered by tester\): Test browser only/);
  assert.match(report, /Frame interval P50: [\d.]+ ms; P95: [\d.]+ ms/);
  assert.match(report, /Peak draw calls \/ rendered triangles per frame/);
  assert.match(report, /memory, thermal, battery and device compatibility were not measured/);
  const storageAfter = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
  assert.equal(storageAfter, storageBefore, 'diagnostics must not write local storage');
  await page.$eval('#diagnostics-discard', el => el.scrollIntoView()); await page.tap('#diagnostics-discard');
  assert.equal(await page.$eval('#diagnostics-report', el => el.value), '');
  assert.equal(await page.$eval('#diagnostics-device', el => el.value), '');
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  console.log('DIAGNOSTICS PASS: paused exclusion, emulated-touch start/stop, report, discard, no diagnostic storage or external HTTP. Not a real-device measurement.');
} finally { await browser.close(); }
