const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage();
  const htmlPath = path.join(__dirname, '..', 'src', 'booklet.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  const outPath = path.join(__dirname, '..', 'build', 'Healthy-Living-Guide.pdf');
  await page.pdf({
    path: outPath,
    width: '8.5in',
    height: '11in',
    printBackground: true,
    margin: { top: '0in', bottom: '0in', left: '0in', right: '0in' },
  });
  await browser.close();
  console.log('Wrote', outPath);
})();
