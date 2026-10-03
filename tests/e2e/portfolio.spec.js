import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const tabs = ['projects', 'experience', 'education', 'stack'];
const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 400, height: 860 },
];
const themes = ['light', 'dark'];

for (const theme of themes) {
  for (const viewport of viewports) {
    test.describe(`${theme} / ${viewport.name}`, () => {
      test.use({ colorScheme: theme, viewport: { width: viewport.width, height: viewport.height } });

      for (const tab of tabs) {
        test(`${tab}: no console errors, no overflow, no accessibility violations`, async ({ page }) => {
          const problems = [];
          page.on('console', (msg) => {
            if (msg.type() === 'error') problems.push(msg.text());
          });
          page.on('pageerror', (err) => problems.push(err.message));

          await page.goto(`/#${tab}`);
          await expect(page.getByRole('tab', { selected: true })).toBeVisible();
          await page.evaluate(() => document.fonts.ready);

          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();
          expect(
            results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
          ).toEqual([]);

          expect(problems).toEqual([]);
        });
      }
    });
  }
}

test('the saved theme survives a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Switch to (dark|light) theme/ }).click();
  const chosen = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(['light', 'dark']).toContain(chosen);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', chosen);
});

test('tabs switch and the URL hash follows', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: /Experience/ }).click();
  await expect(page.getByRole('heading', { name: "Where I've worked" })).toBeVisible();
  await expect(page).toHaveURL(/#experience$/);
  await page.getByRole('tab', { name: /Tech stack/ }).click();
  await expect(page.getByRole('heading', { name: 'Tech inventory' })).toBeVisible();
});

test('the profile photo loads', async ({ page }) => {
  await page.goto('/');
  const loaded = await page
    .getByAltText('Muhammad Wajdan Ismail')
    .evaluate((img) => img.complete && img.naturalWidth > 0);
  expect(loaded).toBe(true);
});

test('responses carry the security headers', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("default-src 'self'");
  expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBeTruthy();
});

test('no outbound link opens without noopener', async ({ page }) => {
  await page.goto('/');
  const bad = await page.$$eval('a[target="_blank"]', (links) =>
    links.filter((a) => !/noopener/.test(a.rel)).map((a) => a.href),
  );
  expect(bad).toEqual([]);
});
