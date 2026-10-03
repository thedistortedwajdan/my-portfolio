import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PDF = '/Muhammad_Wajdan_Ismail_Resume.pdf';
const FILE = 'Muhammad_Wajdan_Ismail_Resume.pdf';

const sizes = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'short desktop', width: 1280, height: 600 },
  { name: 'tablet', width: 820, height: 1100 },
  { name: 'phone', width: 400, height: 860 },
  { name: 'small phone', width: 320, height: 568 },
];

const view = (page) => page.getByRole('button', { name: /View resume/ });
const dialog = (page) => page.getByRole('dialog', { name: 'Resume' });

async function open(page) {
  await view(page).click();
  await expect(dialog(page)).toBeVisible();
}

async function watchProblems(page) {
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(msg.text());
  });
  page.on('pageerror', (err) => problems.push(err.message));
  return problems;
}

test.describe('the PDF file', () => {
  test('is served as a PDF with the security headers', async ({ request }) => {
    const response = await request.get(PDF);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    const csp = response.headers()['content-security-policy'];
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("frame-src 'self'");
    const body = await response.body();
    expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(body.length).toBeGreaterThan(20_000);
  });

  test('matches the file in public/', async ({ request }) => {
    const served = await (await request.get(PDF)).body();
    const onDisk = await readFile(`public/${FILE}`);
    expect(served.equals(onDisk)).toBe(true);
  });
});

test.describe('opening and closing', () => {
  test('opens a modal with the PDF, with no console errors or CSP violations', async ({ page }) => {
    const problems = await watchProblems(page);
    await page.goto('/');
    await open(page);
    const frame = dialog(page).locator('iframe');
    await expect(frame).toHaveAttribute('src', `${PDF}#view=FitH`);
    await expect(frame).toHaveAttribute('title', 'Resume, PDF');
    await expect(frame).toBeVisible();
    const box = await frame.boundingBox();
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThan(200);
    await page.waitForTimeout(600);
    expect(problems).toEqual([]);
  });

  test('does not request the PDF until the modal is opened', async ({ page }) => {
    const requested = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.pdf')) requested.push(request.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(requested).toEqual([]);
    await open(page);
    await expect.poll(() => requested.length).toBeGreaterThan(0);
  });

  test('Escape closes it and focus returns to the button', async ({ page }) => {
    await page.goto('/');
    await open(page);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(view(page)).toBeFocused();
  });

  test('the close button closes it and focus returns to the button', async ({ page }) => {
    await page.goto('/');
    await open(page);
    await dialog(page).getByRole('button', { name: 'Close resume' }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(view(page)).toBeFocused();
  });

  test('a click on the backdrop closes it, a click inside does not', async ({ page }) => {
    await page.goto('/');
    await open(page);
    await dialog(page).getByRole('heading', { name: 'Resume' }).click();
    await expect(dialog(page)).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(dialog(page)).toBeHidden();
  });

  test('can be reopened and the PDF loads again each time', async ({ page }) => {
    await page.goto('/');
    for (let round = 0; round < 3; round += 1) {
      await open(page);
      await expect(dialog(page).locator('iframe')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();
    }
  });

  test('closes at once when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await open(page);
    await dialog(page).getByRole('button', { name: 'Close resume' }).click();
    await expect(dialog(page)).toBeHidden({ timeout: 120 });
  });

  test('works from every tab', async ({ page }) => {
    for (const tab of ['projects', 'experience', 'education', 'stack']) {
      await page.goto(`/#${tab}`);
      await open(page);
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`#${tab}$`));
    }
  });
});

test.describe('keyboard and focus', () => {
  test('the button opens with Enter and Space, and Tab never reaches the page behind', async ({ page }) => {
    await page.goto('/');
    await view(page).focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();

    await view(page).focus();
    await page.keyboard.press('Space');
    await expect(dialog(page)).toBeVisible();

    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest('dialog') || document.activeElement === document.body,
      );
      expect(inside, `focus after Tab ${i + 1} stays in the dialog or browser UI`).toBe(true);
    }
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Shift+Tab');
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest('dialog') || document.activeElement === document.body,
      );
      expect(inside, `focus after Shift+Tab ${i + 1} stays in the dialog or browser UI`).toBe(true);
    }
  });

  test('the page behind the modal cannot be clicked or reached', async ({ page }) => {
    await page.goto('/');
    await open(page);
    const tab = page.getByRole('tab', { name: /Experience/ });
    await expect(tab.click({ trial: true, timeout: 1000 })).rejects.toThrow();
    await expect(page.locator('dialog:modal')).toHaveCount(1);
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('downloading', () => {
  test('the sidebar link downloads the PDF under a clean name', async ({ page }) => {
    await page.goto('/');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: /Download resume/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(FILE);
    const saved = await readFile(await download.path());
    expect(saved.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(saved.equals(await readFile(`public/${FILE}`))).toBe(true);
  });

  test('the modal link downloads it too', async ({ page }) => {
    await page.goto('/');
    await open(page);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      dialog(page).getByRole('link', { name: /Download/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(FILE);
    await expect(dialog(page)).toBeVisible();
  });
});

test.describe('layout', () => {
  for (const size of sizes) {
    test(`${size.name} (${size.width}x${size.height}): buttons are reachable and the modal fits`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/');

      const viewBox = await view(page).boundingBox();
      const downloadBox = await page.getByRole('link', { name: /Download resume/ }).boundingBox();
      for (const box of [viewBox, downloadBox]) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(size.width);
        expect(box.height).toBeGreaterThanOrEqual(30);
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      await open(page);
      await page.waitForTimeout(400);
      const box = await dialog(page).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(size.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(size.height + 1);
      await expect(dialog(page).getByRole('button', { name: 'Close resume' })).toBeInViewport();
      await expect(dialog(page).getByRole('link', { name: /Download/ })).toBeInViewport();
      await expect(dialog(page).getByRole('link', { name: /Open the PDF in a new tab/ })).toBeInViewport();
      const frame = await dialog(page).locator('iframe').boundingBox();
      expect(frame.height).toBeGreaterThan(size.height * 0.45);
    });
  }

  test('on a phone the modal is a full-screen sheet and the page behind does not scroll', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 860 });
    await page.goto('/');
    await open(page);
    await page.waitForTimeout(400);
    const box = await dialog(page).boundingBox();
    expect(Math.round(box.width)).toBe(400);
    expect(Math.round(box.height)).toBe(860);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
  });

  test('on a phone the compact header carries both resume buttons beside the contact toggle', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 860 });
    await page.goto('/');
    await expect(view(page)).toBeVisible();
    await expect(page.getByRole('link', { name: /Download resume/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contact me' })).toBeVisible();
    const header = await page.locator('aside.id').boundingBox();
    expect(header.height).toBeLessThan(330);
  });
});

for (const theme of ['light', 'dark']) {
  for (const size of [sizes[0], sizes[3]]) {
    test(`accessibility with the modal open: ${theme} / ${size.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        colorScheme: theme,
        viewport: { width: size.width, height: size.height },
      });
      const page = await context.newPage();
      await page.goto('/');
      await open(page);
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('iframe')
        .analyze();
      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
      ).toEqual([]);
      await context.close();
    });
  }
}

test.describe('scrollbars', () => {
  test('on desktop the card and the sheet show their bar only on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto('/#experience');
    const color = (selector) =>
      page.locator(selector).evaluate((node) => getComputedStyle(node).scrollbarColor);
    const hidden = (value) => /^rgba\(0, 0, 0, 0\) rgba\(0, 0, 0, 0\)$|^transparent transparent$/.test(value);

    await page.mouse.move(640, 5);
    await expect.poll(() => color('aside.id').then(hidden)).toBe(true);
    await expect.poll(() => color('.panel').then(hidden)).toBe(true);

    await page.locator('aside.id').hover();
    await expect.poll(() => color('aside.id').then(hidden)).toBe(false);
    await page.locator('.panel').hover();
    await expect.poll(() => color('.panel').then(hidden)).toBe(false);
    await expect.poll(() => color('aside.id').then(hidden)).toBe(true);

    await page.mouse.move(640, 5);
    await expect.poll(() => color('.panel').then(hidden)).toBe(true);
  });

  test('on desktop the bar shows while the card has keyboard focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto('/');
    await page.mouse.move(640, 5);
    await view(page).focus();
    await expect
      .poll(() => page.locator('aside.id').evaluate((node) => getComputedStyle(node).scrollbarColor))
      .not.toMatch(/^rgba\(0, 0, 0, 0\) rgba\(0, 0, 0, 0\)$/);
  });

  test('on a phone the bar is always shown', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 860 });
    await page.goto('/');
    await page.mouse.move(200, 5);
    const colors = await page.evaluate(() => ({
      page: getComputedStyle(document.documentElement).scrollbarColor,
      card: getComputedStyle(document.querySelector('aside.id')).scrollbarColor,
    }));
    for (const value of Object.values(colors)) {
      expect(value).not.toMatch(/^rgba\(0, 0, 0, 0\) rgba\(0, 0, 0, 0\)$/);
    }
  });

  test('a hover-less wide screen (a tablet) keeps the bar visible too', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 700 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto('/');
    const value = await page.locator('aside.id').evaluate((node) => getComputedStyle(node).scrollbarColor);
    expect(value).not.toMatch(/^rgba\(0, 0, 0, 0\) rgba\(0, 0, 0, 0\)$/);
    await context.close();
  });

  test('the sidebar and the sheet still scroll on their own on a short desktop window', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto('/#experience');
    const metrics = await page.evaluate(() => {
      const card = document.querySelector('aside.id');
      const panel = document.querySelector('.panel');
      return {
        cardScrolls: card.scrollHeight > card.clientHeight,
        panelScrolls: panel.scrollHeight > panel.clientHeight,
        pageScrolls: document.documentElement.scrollHeight > innerHeight,
      };
    });
    expect(metrics).toEqual({ cardScrolls: true, panelScrolls: true, pageScrolls: false });
  });
});
