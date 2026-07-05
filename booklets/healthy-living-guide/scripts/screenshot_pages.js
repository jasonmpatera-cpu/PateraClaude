const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
  const htmlPath = path.join(__dirname, '..', 'src', 'booklet.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  const outDir = path.join(__dirname, '_pagecheck');
  fs.mkdirSync(outDir, { recursive: true });
  const pages = await page.locator('.page').all();
  for (let i = 0; i < pages.length; i++) {
    await pages[i].screenshot({ path: path.join(outDir, `page_${String(i+1).padStart(2,'0')}.png`) });
  }
  await browser.close();
  console.log('Wrote', pages.length, 'page screenshots to', outDir);
})();
