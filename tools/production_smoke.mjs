// Run against `npm run preview` after a production build, not against Vite dev.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url = process.env.GAME_URL || 'http://127.0.0.1:4173/';
const origin = new URL(url).origin;
const external = [], errors = [], failed = [];
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
});
try {
  const page = await browser.newPage();
  page.on('request', request => {
    const address = new URL(request.url());
    if (['http:', 'https:'].includes(address.protocol) && address.origin !== origin) external.push(request.url());
  });
  page.on('requestfailed', request => failed.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#garage-launch', { timeout: 60000 });
  await page.waitForFunction(() => !document.querySelector('#boot-screen'), { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => '__gameDebug' in window), false, 'debug globals must not be exposed in production');
  assert.equal(await page.evaluate(() => document.fonts.check('16px "Noto Sans Bengali"', 'বাংলা')), true);
  await page.click('#garage-launch');
  await page.click('[data-tab="modes"]');
  await page.click('[data-mode="Rescue"]');
  await page.click('#garage-close');
  await page.keyboard.down('w');
  await page.waitForFunction(() => Number(document.querySelector('#speed').textContent) > 0, { timeout: 15000 });
  await page.keyboard.up('w');
  await page.click('#garage-launch');
  await page.click('[data-finish]');
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  assert.deepEqual(external, []);
  console.log('PRODUCTION SMOKE PASS: boot, bundled Bengali font, driving and Rescue cancellation; no debug global, failed requests or cross-origin HTTP requests observed.');
} finally {
  await browser.close();
}
