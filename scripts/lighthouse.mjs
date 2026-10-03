// Runs Lighthouse against the production build and fails if a score drops below its threshold.
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { launch } from 'chrome-launcher';
import { chromiumPath, startPreview } from './browser.mjs';

const thresholds = { performance: 0.9, accessibility: 0.95, 'best-practices': 0.95, seo: 0.95 };

const { server, url } = await startPreview();
const chrome = await launch({
  chromePath: chromiumPath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

let failed = false;
try {
  for (const formFactor of ['desktop', 'mobile']) {
    const result = await lighthouse(
      url,
      { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: Object.keys(thresholds) },
      formFactor === 'desktop' ? desktopConfig : undefined,
    );
    const categories = result.lhr.categories;
    console.log(`\nLighthouse (${formFactor})`);
    for (const [id, min] of Object.entries(thresholds)) {
      const score = categories[id].score ?? 0;
      const ok = score >= min;
      if (!ok) failed = true;
      console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(15)} ${Math.round(score * 100)}  (min ${Math.round(min * 100)})`);
      if (!ok) {
        for (const ref of categories[id].auditRefs) {
          const audit = result.lhr.audits[ref.id];
          if (audit.score !== null && audit.score < 1 && ref.weight > 0) {
            console.log(`        - ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ''}`);
          }
        }
      }
    }
  }
} finally {
  await chrome.kill();
  server.httpServer.close();
}
process.exit(failed ? 1 : 0);
