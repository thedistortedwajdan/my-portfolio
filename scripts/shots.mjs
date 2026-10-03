// Renders every tab in both themes at desktop and phone width.
// Usage: npm run shots [-- <output folder>]   (default: screenshots/)
// Screenshots are for visual review against design/reference. They are not pixel-compared,
// because fonts and anti-aliasing differ between operating systems.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, launchOptions, startPreview } from './browser.mjs';

const outDir = process.argv[2] ?? 'screenshots';
const tabs = ['projects', 'experience', 'education', 'stack'];
const viewports = [
  { name: 'desktop', width: 1280, height: 900, fullPage: false },
  { name: 'phone', width: 400, height: 860, fullPage: true },
];

await mkdir(outDir, { recursive: true });
const { server, url } = await startPreview();
const browser = await chromium.launch(launchOptions());

try {
  for (const colorScheme of ['light', 'dark']) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        colorScheme,
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      for (const tab of tabs) {
        await page.goto(`${url}/#${tab}`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        const file = path.join(outDir, `${colorScheme}-${vp.name}-${tab}.png`);
        await page.screenshot({ path: file, fullPage: vp.fullPage });
        console.log('saved', file);
      }
      // The resume modal, over the first tab.
      await page.goto(`${url}/#projects`);
      await page.getByRole('button', { name: /View resume/ }).click();
      await page.waitForTimeout(700);
      const modalFile = path.join(outDir, `${colorScheme}-${vp.name}-resume-modal.png`);
      await page.screenshot({ path: modalFile });
      console.log('saved', modalFile);
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.httpServer.close();
}
