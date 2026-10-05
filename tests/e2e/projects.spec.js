import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const FOLIO = /See details: Folio/;
const REPO = 'https://github.com/thedistortedwajdan/SpringBoot-Digital-Wallet';
const GIG = /See details: GigPilot/;
const dialog = (page, name = 'Folio Digital Wallet') => page.getByRole('dialog', { name });
const slideTab = (page, name) => dialog(page).getByRole('tab', { name, exact: true });
const counter = (page) => dialog(page).locator('.cs-count').textContent();

async function open(page, button = FOLIO, name = 'Folio Digital Wallet') {
  await page.goto('/#projects');
  await page.getByRole('button', { name: button }).click();
  await expect(dialog(page, name)).toBeVisible();
  // The dialog fades and rises in; wait for it to settle so boxes can be measured.
  await page.waitForTimeout(350);
}

async function watch(page) {
  const problems = [];
  const bad = [];
  page.on('console', (msg) => msg.type() === 'error' && problems.push(msg.text()));
  page.on('pageerror', (err) => problems.push(err.message));
  page.on('requestfailed', (request) => request.url().includes('/projects/') && bad.push(`failed: ${request.url()}`));
  page.on('response', (response) => response.url().includes('/projects/') && response.status() >= 400 && bad.push(`${response.status()}: ${response.url()}`));
  return { problems, bad };
}

const slideTitles = [
  'Send and receive',
  'Wallet overview',
  'Send: lookup in progress',
  'Send: recipient verified',
  'Send: confirm with MPIN',
  'Send: receipt',
  'Notifications',
  'Activity ledger',
  'Withdraw guard',
  'Admin: people',
  'On a phone',
  'Send and receive (phone)',
  'The Test lab',
];

test.describe('the project cards', () => {
  test('both projects have a card, and the social media project is gone', async ({ page }) => {
    await page.goto('/#projects');
    await expect(page.getByRole('heading', { level: 3, name: 'GigPilot' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Folio Digital Wallet' })).toBeVisible();
    await expect(page.getByText('Social Media Website')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /See details/ })).toHaveCount(2);
  });

  test('the Folio card shows a real screenshot that loads, in the right theme', async ({ browser }) => {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto('/#projects');
      const shot = page.locator('.proj-shot');
      await shot.scrollIntoViewIfNeeded();
      await expect(shot).toHaveAttribute('src', `/projects/folio/card-${theme}.webp`);
      await expect.poll(() => shot.evaluate((img) => img.complete && img.naturalWidth)).toBe(760);
      await expect(shot).toHaveAttribute('alt', /Folio wallet overview/);
      await context.close();
    }
  });

  test('a click anywhere on a card opens it, not just on the button', async ({ page }) => {
    await page.goto('/#projects');
    // The button's invisible cover sits over the whole card, so click by position, as a visitor would.
    const clickOn = async (locator) => {
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    };
    await clickOn(page.locator('.proj').nth(1).locator('h3'));
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await clickOn(page.locator('.proj').nth(0).locator('.desc'));
    await expect(dialog(page, 'GigPilot')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page, 'GigPilot')).toBeHidden();
    await clickOn(page.locator('.proj').nth(1).locator('.pbody .chips'));
    await expect(dialog(page)).toBeVisible();
  });

  test('the keyboard opens a card, and Escape closes it and puts focus back on its button', async ({ page }) => {
    await page.goto('/#projects');
    const button = page.getByRole('button', { name: FOLIO });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(button).toBeFocused();
    await page.keyboard.press('Space');
    await expect(dialog(page)).toBeVisible();
  });

  test('nothing from the project is fetched until it is opened', async ({ page }) => {
    const seen = [];
    page.on('request', (request) => /\/projects\/folio\/(screens|video|thumbs)\//.test(request.url()) && seen.push(request.url()));
    await page.goto('/#projects');
    await page.waitForLoadState('networkidle');
    expect(seen, 'no slides, clips or thumbnails before opening').toEqual([]);
  });
});

test.describe('the modal', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('opens with the title and tagline, both columns visible, inside the window', async ({ page }) => {
    await open(page);
    const box = await dialog(page).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1440);
    expect(box.y + box.height).toBeLessThanOrEqual(900);
    await expect(dialog(page).getByRole('heading', { level: 2, name: 'Folio Digital Wallet' })).toBeVisible();
    await expect(dialog(page).locator('.pm-status'), 'no status pill for Folio').toHaveCount(0);
    await expect(dialog(page).locator('.pm-tagline')).toContainText('checked by IBAN, bank and account holder');
    const stage = await dialog(page).locator('.pm-stage').boundingBox();
    const side = await dialog(page).locator('.pm-side').boundingBox();
    expect(side.x, 'details sit beside the slides').toBeGreaterThanOrEqual(stage.x + stage.width - 2);
    expect(stage.width).toBeGreaterThan(side.width);
  });

  test('closes with the button, with Escape and with a click on the backdrop, and focus goes back to the card', async ({ page }) => {
    const button = page.getByRole('button', { name: FOLIO });
    await open(page);
    await dialog(page).getByRole('button', { name: 'Close project details' }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();

    await button.click();
    await expect(dialog(page)).toBeVisible();
    await dialog(page).getByRole('heading', { level: 2 }).click();
    await expect(dialog(page), 'a click inside does not close it').toBeVisible();
    await page.mouse.click(8, 8);
    await expect(dialog(page)).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('traps focus inside, and the page behind cannot be reached or scrolled', async ({ page }) => {
    await open(page);
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => !!document.activeElement?.closest('dialog') || document.activeElement === document.body);
      expect(inside, `focus after Tab ${i + 1} stays in the dialog`).toBe(true);
    }
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
    await expect(page.getByRole('tab', { name: /Experience/ }).click({ trial: true, timeout: 800 })).rejects.toThrow();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
  });

  test('is gone from the page after closing, so no clip keeps playing behind it', async ({ page }) => {
    await open(page);
    await expect(dialog(page).locator('video').first()).toBeAttached();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(page.locator('dialog.project-modal')).toHaveCount(0);
    await expect(page.locator('video')).toHaveCount(0);
  });

  test('opens GigPilot on its own text slides, without fetching any Folio slides or clips', async ({ page }) => {
    const folioRequests = [];
    page.on('request', (request) => /\/projects\/folio\/(screens|video|thumbs)\//.test(request.url()) && folioRequests.push(request.url()));
    await open(page, GIG, 'GigPilot');
    await expect(dialog(page, 'GigPilot').locator('.cs-count')).toHaveText('1 / 3');
    await expect(dialog(page, 'GigPilot').locator('.pm-status')).toHaveText('Full-stack project');
    await expect(dialog(page, 'GigPilot').locator('.cs-slide:not([inert]) svg.viz')).toBeVisible();
    await dialog(page, 'GigPilot').getByRole('tab', { name: 'What it does', exact: true }).click();
    await expect(dialog(page, 'GigPilot').locator('.cs-slide:not([inert]) .cs-cards li')).toHaveCount(4);
    expect(folioRequests).toEqual([]);
  });

  test('the page behind keeps the right tab and hash after the modal closes', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.getByRole('tab', { name: /Projects/, selected: true })).toBeVisible();
  });
});

test.describe('the slide show', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('next and previous move one slide, wrap round, and slide the track', async ({ page }) => {
    await open(page);
    const track = dialog(page).locator('.cs-track');
    const width = (await dialog(page).locator('.cs-viewport').boundingBox()).width - 2;
    const shift = () => track.evaluate((n) => new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
    expect(await counter(page)).toBe('1 / 13');
    await dialog(page).getByRole('button', { name: 'Next slide' }).click();
    await expect(dialog(page).locator('.cs-count')).toHaveText('2 / 13');
    await expect.poll(shift).toBeCloseTo(-width, -1);
    await dialog(page).getByRole('button', { name: 'Previous slide' }).click();
    await dialog(page).getByRole('button', { name: 'Previous slide' }).click();
    await expect(dialog(page).locator('.cs-count')).toHaveText('13 / 13');
    await expect.poll(shift).toBeCloseTo(-12 * width, -1);
    await dialog(page).getByRole('button', { name: 'Next slide' }).click();
    await expect(dialog(page).locator('.cs-count')).toHaveText('1 / 13');
  });

  test('the arrow keys, Home and End on the thumbnails, and clicking one, all work', async ({ page }) => {
    await open(page);
    await slideTab(page, 'Send and receive').focus();
    await page.keyboard.press('ArrowRight');
    await expect(slideTab(page, 'Wallet overview')).toBeFocused();
    await expect(dialog(page).locator('.cs-count')).toHaveText('2 / 13');
    await page.keyboard.press('End');
    await expect(slideTab(page, 'The Test lab')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(dialog(page).locator('.cs-count')).toHaveText('1 / 13');
    await slideTab(page, 'Activity ledger').click();
    await expect(dialog(page).locator('.cs-count')).toHaveText('8 / 13');
    await expect(dialog(page).locator('.cs-caption h3')).toHaveText('Activity ledger');
  });

  test('the left and right arrow keys work from the arrow buttons too', async ({ page }) => {
    await open(page);
    await dialog(page).getByRole('button', { name: 'Next slide' }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(dialog(page).locator('.cs-count')).toHaveText('3 / 13');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog(page).locator('.cs-count')).toHaveText('2 / 13');
  });

  test('a swipe moves between slides, in both directions', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 400, height: 860 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await open(page);
    const area = dialog(page).locator('.cs-viewport');
    const swipe = (from, to) =>
      area.evaluate(
        (node, [a, b]) => {
          const box = node.getBoundingClientRect();
          const y = box.top + box.height / 2;
          for (const [type, x] of [['pointerdown', a], ['pointerup', b]]) {
            node.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', clientX: box.left + x, clientY: y, bubbles: true }));
          }
        },
        [from, to],
      );
    await swipe(300, 80);
    await expect(dialog(page).locator('.cs-count')).toHaveText('2 / 13');
    await swipe(80, 300);
    await expect(dialog(page).locator('.cs-count')).toHaveText('1 / 13');
    await swipe(200, 180);
    await expect(dialog(page).locator('.cs-count'), 'a tiny movement is not a swipe').toHaveText('1 / 13');
    await context.close();
  });

  test('the chosen thumbnail is always scrolled into view in its strip', async ({ page }) => {
    await open(page);
    await slideTab(page, 'The Test lab').click();
    await expect(dialog(page).locator('.cs-count')).toHaveText('13 / 13');
    await expect
      .poll(async () => {
        const strip = await dialog(page).locator('.cs-thumbs').boundingBox();
        const thumb = await slideTab(page, 'The Test lab').boundingBox();
        return thumb.x >= strip.x - 1 && thumb.x + thumb.width <= strip.x + strip.width + 1;
      })
      .toBe(true);
  });

  test('every slide shows what it should: each of the 13 loads, in order, with its title and caption', async ({ page }) => {
    const { problems, bad } = await watch(page);
    await open(page);
    for (const [index, title] of slideTitles.entries()) {
      await slideTab(page, title).click();
      await expect(dialog(page).locator('.cs-count')).toHaveText(`${index + 1} / 13`);
      await expect(dialog(page).locator('.cs-caption h3')).toHaveText(title);
      const current = dialog(page).locator('.cs-slide:not([inert])');
      await expect(current).toHaveCount(1);
      await expect(current).toBeVisible();
      const kind = await current.evaluate((n) => (n.querySelector('video') ? 'video' : n.querySelector('.cs-phones') ? 'phones' : 'shot'));
      if (kind === 'shot') {
        await expect.poll(() => current.locator('img.cs-shot').evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(1000);
      } else if (kind === 'phones') {
        await expect.poll(() => current.locator('.cs-phone img').evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 500))).toBe(true);
        await expect(current.locator('.cs-phone')).toHaveCount(3);
      } else {
        const poster = await current.locator('video').getAttribute('poster');
        const ok = await page.evaluate((src) => fetch(src).then((r) => r.ok && r.headers.get('content-type')), poster);
        expect(ok, `poster of ${title}`).toMatch(/image\/jpeg/);
      }
      const box = await current.boundingBox();
      expect(box.width, `${title} has room`).toBeGreaterThan(300);
    }
    await page.waitForTimeout(400);
    expect(bad, 'no missing or failed files').toEqual([]);
    expect(problems, 'no console errors, no CSP violations').toEqual([]);
  });

  test('every thumbnail loads, and the strip never shows a broken picture', async ({ page }) => {
    await open(page);
    const thumbs = dialog(page).locator('.cs-thumb img');
    await expect(thumbs).toHaveCount(13);
    for (let i = 0; i < 13; i += 1) {
      await slideTab(page, slideTitles[i]).scrollIntoViewIfNeeded();
      await expect.poll(() => thumbs.nth(i).evaluate((img) => img.complete && img.naturalWidth)).toBe(320);
    }
  });

  test('only the slide in view and its neighbours fetch their pictures', async ({ page }) => {
    const screens = [];
    page.on('request', (request) => /\/projects\/folio\/screens\//.test(request.url()) && screens.push(request.url()));
    await open(page);
    await page.waitForTimeout(500);
    expect(screens.length, 'on opening: the overview, next to the first clip').toBeLessThanOrEqual(2);
    await slideTab(page, 'Send: receipt').click();
    await page.waitForTimeout(500);
    expect(screens.length).toBeLessThanOrEqual(5);
    expect(screens.some((url) => url.includes('13-admin-people')), 'far slides are not fetched').toBe(false);
  });

  test('the tall admin screenshot fades out and links to the full page, which opens safely and loads', async ({ page, context }) => {
    await open(page);
    await slideTab(page, 'Admin: people').click();
    const link = dialog(page).getByRole('link', { name: /See the full page/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('target', '_blank');
    expect(await dialog(page).locator('.cs-shot.tall').evaluate((n) => getComputedStyle(n).maskImage || getComputedStyle(n).webkitMaskImage)).toContain('linear-gradient');
    const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
    await popup.waitForLoadState();
    expect(popup.url()).toContain('/projects/folio/screens/13-admin-people-');
    expect(await popup.evaluate(() => document.querySelector('img')?.naturalHeight)).toBe(1875);
    await popup.close();
  });

  test('the phone slide shows three phones side by side that fit the frame', async ({ page }) => {
    await open(page);
    await slideTab(page, 'On a phone').click();
    await page.waitForTimeout(700);
    const view = await dialog(page).locator('.cs-viewport').boundingBox();
    const phones = await dialog(page).locator('.cs-slide:not([inert]) .cs-phone').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().toJSON()));
    expect(phones).toHaveLength(3);
    for (const box of phones) {
      expect(box.x).toBeGreaterThanOrEqual(view.x);
      expect(box.x + box.width).toBeLessThanOrEqual(view.x + view.width);
      expect(box.y).toBeGreaterThanOrEqual(view.y);
      expect(box.y + box.height).toBeLessThanOrEqual(view.y + view.height + 1);
      expect(box.height / box.width, 'phone proportions').toBeCloseTo(2.17, 0);
    }
    expect(phones[0].x + phones[0].width).toBeLessThan(phones[1].x);
  });
});

test.describe('the clips', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const canPlayMp4 = (page) => page.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"') !== '');
  const paused = (page) => dialog(page).locator('.cs-slide:not([inert]) video').evaluate((v) => v.paused);

  test('the first clip starts by itself, muted and looping, and pauses and plays from its button', async ({ page }) => {
    test.skip(!(await (async () => { await page.goto('/'); return canPlayMp4(page); })()), 'this browser has no H.264 decoder');
    await open(page);
    const video = dialog(page).locator('.cs-slide:not([inert]) video');
    await expect.poll(() => paused(page)).toBe(false);
    expect(await video.evaluate((v) => [v.muted, v.loop, v.hasAttribute('playsinline'), v.error])).toEqual([true, true, true, null]);
    await dialog(page).getByRole('button', { name: 'Pause video' }).click();
    await expect.poll(() => paused(page)).toBe(true);
    await expect(dialog(page).getByRole('button', { name: 'Play video' })).toBeVisible();
    await dialog(page).getByRole('button', { name: 'Play video' }).click();
    await expect.poll(() => paused(page)).toBe(false);
  });

  test('a clip really plays: time moves forward, and it is the size of the file', async ({ page }) => {
    test.skip(!(await (async () => { await page.goto('/'); return canPlayMp4(page); })()), 'this browser has no H.264 decoder');
    await open(page);
    const video = dialog(page).locator('.cs-slide:not([inert]) video');
    await expect.poll(() => video.evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(2);
    const first = await video.evaluate((v) => v.currentTime);
    await page.waitForTimeout(900);
    expect(await video.evaluate((v) => v.currentTime)).toBeGreaterThan(first);
    expect(await video.evaluate((v) => [v.videoWidth, v.videoHeight])).toEqual([1440, 900]);
    expect(await video.evaluate((v) => Math.round(v.duration))).toBeGreaterThanOrEqual(40);
  });

  test('leaving a clip pauses it, and coming back plays it again', async ({ page }) => {
    test.skip(!(await (async () => { await page.goto('/'); return canPlayMp4(page); })()), 'this browser has no H.264 decoder');
    await open(page);
    const hero = dialog(page).locator('video').first();
    await expect.poll(() => hero.evaluate((v) => v.paused)).toBe(false);
    await slideTab(page, 'Wallet overview').click();
    await expect.poll(() => hero.evaluate((v) => v.paused)).toBe(true);
    await slideTab(page, 'Send and receive').click();
    await expect.poll(() => hero.evaluate((v) => v.paused)).toBe(false);
  });

  test('the phone clip sits in a phone frame, and the third clip plays when its slide is reached', async ({ page }) => {
    test.skip(!(await (async () => { await page.goto('/'); return canPlayMp4(page); })()), 'this browser has no H.264 decoder');
    await open(page);
    await slideTab(page, 'Send and receive (phone)').click();
    const phone = dialog(page).locator('.cs-slide:not([inert]) .cs-phone-video');
    await expect(phone).toBeVisible();
    const box = await phone.boundingBox();
    expect(box.height / box.width).toBeCloseTo(844 / 390, 1);
    await expect.poll(() => paused(page)).toBe(false);
    await slideTab(page, 'The Test lab').click();
    await expect.poll(() => paused(page)).toBe(false);
    expect(await dialog(page).locator('.cs-slide:not([inert]) video').getAttribute('poster')).toContain('test-lab-tour-desktop-poster.jpg');
  });

  test('with reduced motion nothing plays until the visitor asks, and the poster shows meanwhile', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await open(page);
    await page.waitForTimeout(600);
    expect(await paused(page)).toBe(true);
    await expect(dialog(page).getByRole('button', { name: 'Play video' })).toBeVisible();
    if (await canPlayMp4(page)) {
      await dialog(page).getByRole('button', { name: 'Play video' }).click();
      await expect.poll(() => paused(page)).toBe(false);
    }
    await context.close();
  });

  test('every clip is described for screen readers, and every clip has a button to stop it', async ({ page }) => {
    await open(page);
    for (const title of ['Send and receive', 'Send and receive (phone)', 'The Test lab']) {
      await slideTab(page, title).click();
      const video = dialog(page).locator('.cs-slide:not([inert]) video');
      expect((await video.getAttribute('aria-label')).length).toBeGreaterThan(30);
      await expect(dialog(page).locator('.cs-slide:not([inert]) .cs-play')).toBeVisible();
    }
  });

  test('a clip shows its poster at once, before it has loaded', async ({ page }) => {
    await open(page);
    await slideTab(page, 'The Test lab').click();
    const poster = await dialog(page).locator('.cs-slide:not([inert]) video').getAttribute('poster');
    const loaded = await page.evaluate(
      (src) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve([image.naturalWidth, image.naturalHeight]);
        image.onerror = () => resolve(null);
        image.src = src;
      }),
      poster,
    );
    expect(loaded).toEqual([1440, 900]);
  });
});

test.describe('the details', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('open on the overview with the summary and what the app does, with no empty boxes left behind', async ({ page }) => {
    await open(page);
    const panel = dialog(page).getByRole('tabpanel', { name: 'Overview' });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Folio is a wallet web app built on top of a Spring Boot wallet API');
    await expect(panel.locator('.dash li')).toHaveCount(8);
    for (const gone of ['.pm-stats', '.pm-facts', '.pm-note', 'dl']) await expect(panel.locator(gone), gone).toHaveCount(0);
    const empty = await panel.evaluate((node) => [...node.querySelectorAll('ul, ol, dl, p')].filter((n) => n.textContent.trim() === '').length);
    expect(empty).toBe(0);
  });

  test('each tab shows its own content, and only one is shown at a time', async ({ page }) => {
    await open(page);
    const tabs = dialog(page).getByRole('tablist', { name: 'Project details' });
    await tabs.getByRole('tab', { name: 'How it works' }).click();
    await expect(dialog(page).locator('.pm-steps li')).toHaveCount(4);
    await expect(dialog(page).locator('.pm-steps li').first()).toContainText('Recipient');
    await tabs.getByRole('tab', { name: 'Under the hood' }).click();
    await expect(dialog(page).locator('.pm-panel h3')).toHaveText('How the API Works Under the Hood');
    await expect(dialog(page).locator('.pm-panel .dash li')).toHaveCount(5);
    await expect(dialog(page).locator('.pm-panel')).toContainText('SELECT ... FOR UPDATE');
    await expect(dialog(page).locator('.pm-cards li')).toHaveCount(0);
    await tabs.getByRole('tab', { name: 'Stack' }).click();
    await expect(dialog(page).locator('.pm-group')).toHaveCount(2);
    await expect(dialog(page).locator('.pm-panel .chip').first()).toBeVisible();
    await expect(dialog(page).locator('.pm-panel')).toHaveCount(1);
  });

  test('the tabs move with the arrow keys, and the panel scrolls when the window is short', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 520 });
    await open(page);
    const tabs = dialog(page).getByRole('tablist', { name: 'Project details' });
    await tabs.getByRole('tab', { name: 'Overview' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.getByRole('tab', { name: 'How it works' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(tabs.getByRole('tab', { name: 'Stack' })).toBeFocused();
    await tabs.getByRole('tab', { name: 'Overview' }).click();
    const scrolls = await dialog(page).locator('.pm-panel').evaluate((n) => n.scrollHeight > n.clientHeight);
    expect(scrolls, 'the overview is longer than a short window').toBe(true);
    await dialog(page).locator('.pm-panel').evaluate((n) => n.scrollTo(0, n.scrollHeight));
    await expect(dialog(page).locator('.pm-panel .dash li').last()).toBeInViewport();
  });

  test('switching tab starts at the top of the panel', async ({ page }) => {
    await open(page);
    await page.setViewportSize({ width: 1280, height: 520 });
    await dialog(page).locator('.pm-panel').evaluate((n) => n.scrollTo(0, 400));
    await dialog(page).getByRole('tab', { name: 'How it works' }).click();
    expect(await dialog(page).locator('.pm-panel').evaluate((n) => n.scrollTop)).toBe(0);
  });
});

test.describe('themes', () => {
  for (const theme of ['light', 'dark']) {
    test(`${theme}: the slides and the thumbnails use the ${theme} pictures`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await open(page);
      await slideTab(page, 'Wallet overview').click();
      await expect(dialog(page).locator('.cs-slide:not([inert]) img.cs-shot')).toHaveAttribute('src', `/projects/folio/screens/03-overview-${theme}.webp`);
      const thumbs = await dialog(page).locator('.cs-thumb img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
      const other = theme === 'light' ? 'dark' : 'light';
      expect(thumbs.filter((src) => src.includes(`-${other}.webp`))).toEqual([]);
      expect(thumbs.filter((src) => src.includes(`-${theme}.webp`)).length).toBeGreaterThanOrEqual(10);
      await context.close();
    });

    test(`${theme}: the modal takes its colours from the theme`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await open(page);
      const colours = await page.evaluate(() => {
        const bg = (selector) => getComputedStyle(document.querySelector(selector)).backgroundColor;
        return { modal: bg('dialog.project-modal'), stage: bg('.pm-stage'), page: getComputedStyle(document.body).color };
      });
      const luminance = (css) => css.match(/\d+/g).slice(0, 3).map(Number).reduce((a, b) => a + b, 0) / 3;
      if (theme === 'light') expect(luminance(colours.modal)).toBeGreaterThan(200);
      else expect(luminance(colours.modal)).toBeLessThan(90);
      expect(colours.stage).not.toBe(colours.modal);
      await context.close();
    });
  }
});

test.describe('on different screens', () => {
  const sizes = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'short laptop', width: 1280, height: 600 },
    { name: 'tablet', width: 820, height: 1100 },
    { name: 'phone', width: 400, height: 860 },
    { name: 'small phone', width: 320, height: 568 },
  ];

  for (const size of sizes) {
    test(`${size.name} (${size.width}x${size.height}): the modal fits and everything can be reached`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await open(page);
      const box = await dialog(page).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(size.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(size.height + 1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await expect(dialog(page).getByRole('button', { name: 'Close project details' })).toBeInViewport();
      await expect(dialog(page).locator('.cs-viewport')).toBeVisible();
      const modalScroll = await dialog(page).evaluate((node) => node.scrollWidth - node.clientWidth);
      expect(modalScroll, 'nothing pushes the modal sideways').toBeLessThanOrEqual(1);

      // Everything below the slides is reachable: by scrolling the panel (desktop) or the sheet (phone).
      const tab = dialog(page).getByRole('tab', { name: 'Stack', exact: true }).last();
      await tab.scrollIntoViewIfNeeded();
      await tab.click();
      await expect(dialog(page).getByRole('tabpanel', { name: 'Stack' })).toBeVisible();
    });
  }

  test('on a phone the modal is a full-screen sheet with the slides above the details', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 860 });
    await open(page);
    const box = await dialog(page).boundingBox();
    expect(Math.round(box.width)).toBe(400);
    expect(Math.round(box.height)).toBe(860);
    const stage = await dialog(page).locator('.pm-stage').boundingBox();
    const side = await dialog(page).locator('.pm-side').boundingBox();
    expect(side.y, 'details are below the slides').toBeGreaterThanOrEqual(stage.y + stage.height - 2);
    await expect(dialog(page).locator('.cs-arrow').first()).toBeVisible();
    await dialog(page).locator('.pm-body').evaluate((n) => n.scrollTo(0, n.scrollHeight));
    await expect(dialog(page).locator('.pm-panel .dash li').last()).toBeInViewport();
  });

  test('on a phone the arrows are always visible, not only on hover', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 400, height: 860 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await open(page);
    expect(await dialog(page).locator('.cs-prev').evaluate((n) => getComputedStyle(n).opacity)).toBe('1');
    await context.close();
  });

  test('on a laptop the arrows appear when the pointer is over the slides', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    await page.mouse.move(5, 5);
    await expect.poll(() => dialog(page).locator('.cs-next').evaluate((n) => getComputedStyle(n).opacity)).toBe('0');
    await dialog(page).locator('.cs-viewport').hover();
    await expect.poll(() => dialog(page).locator('.cs-next').evaluate((n) => getComputedStyle(n).opacity)).toBe('1');
  });

  test('a short window lets the slides column scroll, so the captions and thumbnails are still reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 560 });
    await open(page);
    const stage = dialog(page).locator('.pm-stage');
    expect(await stage.evaluate((n) => n.scrollHeight > n.clientHeight)).toBe(true);
    await stage.evaluate((n) => n.scrollTo(0, n.scrollHeight));
    await expect(dialog(page).locator('.cs-thumbs')).toBeInViewport();
    await slideTab(page, 'Activity ledger').click();
    await expect(dialog(page).locator('.cs-count')).toHaveText('8 / 13');
  });

  test('the project cards themselves stay free of sideways scrolling at 400px', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 860 });
    await page.goto('/#projects');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await expect(page.locator('.proj-open').first()).toBeVisible();
  });
});

test.describe('accessibility', () => {
  const cases = [
    { name: 'a clip', open: () => {} },
    { name: 'a screenshot', open: (page) => slideTab(page, 'Send: confirm with MPIN').click() },
    { name: 'the tall screenshot', open: (page) => slideTab(page, 'Admin: people').click() },
    { name: 'the phone slide', open: (page) => slideTab(page, 'On a phone').click() },
    { name: 'the details: how it works', open: (page) => dialog(page).getByRole('tab', { name: 'How it works' }).click() },
    { name: 'the details: under the hood', open: (page) => dialog(page).getByRole('tab', { name: 'Under the hood' }).click() },
    { name: 'the details: stack', open: (page) => dialog(page).getByRole('tab', { name: 'Stack', exact: true }).last().click() },
  ];

  for (const theme of ['light', 'dark']) {
    for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 400, height: 860 }]]) {
      test(`${theme} / ${label}: no WCAG 2.1 AA violations across the slides and the tabs`, async ({ browser }) => {
        // Seven states are audited one after another, each after its animation settles.
        test.setTimeout(120000);
        const context = await browser.newContext({ colorScheme: theme, viewport });
        const page = await context.newPage();
        await open(page);
        for (const step of cases) {
          await step.open(page);
          await page.waitForTimeout(700);
          const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          expect(
            results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
            `${step.name}, ${theme}, ${label}`,
          ).toEqual([]);
        }
        await context.close();
      });
    }
  }

  test('GigPilot passes too, on its text slides', async ({ page }) => {
    test.setTimeout(90000);
    await open(page, GIG, 'GigPilot');
    for (const title of ['The idea', 'What it does', 'How it is built']) {
      await dialog(page, 'GigPilot').getByRole('tab', { name: title, exact: true }).click();
      await page.waitForTimeout(600);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => v.id), title).toEqual([]);
    }
  });

  test('the projects tab itself, with the new cards, passes axe in both themes', async ({ browser }) => {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({ colorScheme, viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto('/#projects');
      await page.locator('.proj-shot').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
      await context.close();
    }
  });

  test('the dialog, the carousel and the tabs are named, and every tab points at a real panel', async ({ page }) => {
    await open(page);
    expect(await dialog(page).getAttribute('aria-labelledby')).toBeTruthy();
    await expect(dialog(page).getByRole('region', { name: 'Folio Digital Wallet: screens and clips' })).toHaveAttribute('aria-roledescription', 'carousel');
    // Every tab that claims a panel points at a real one that it labels. The details tabs share one panel and
    // only the selected tab claims it.
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll('dialog [role="tab"][aria-controls]')].filter((tab) => {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        return !panel || panel.getAttribute('aria-labelledby') !== tab.id;
      }).length,
    );
    const unclaimed = await page.evaluate(() => [...document.querySelectorAll('dialog .pm-tabs [role="tab"]:not([aria-selected="true"])')].filter((t) => t.hasAttribute('aria-controls')).length);
    expect(unclaimed).toBe(0);
    expect(broken).toBe(0);
    const focusable = await page.evaluate(() => [...document.querySelectorAll('dialog .cs-slide[inert] button, dialog .cs-slide[inert] a')].length);
    expect(focusable, 'the hidden slides still hold their buttons, but inert keeps them out of reach').toBeGreaterThan(0);
    await page.keyboard.press('Tab');
    for (let i = 0; i < 40; i += 1) {
      const reachable = await page.evaluate(() => !!document.activeElement?.closest('.cs-slide[inert]'));
      expect(reachable).toBe(false);
      await page.keyboard.press('Tab');
    }
  });
});

test('the resume modal and the project modal do not get in each other’s way', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#projects');
  await page.getByRole('button', { name: /View resume/ }).click();
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeHidden();
  await page.getByRole('button', { name: FOLIO }).click();
  await expect(dialog(page)).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
});

test('the scene behind the page pauses while a project is open', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#projects');
  const state = () => page.evaluate(() => getComputedStyle(document.querySelector('.layer.front .wave')).animationPlayState);
  expect(await state()).toBe('running');
  await page.getByRole('button', { name: FOLIO }).click();
  await expect(dialog(page)).toBeVisible();
  expect(await state()).toBe('paused');
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  expect(await state()).toBe('running');
});


test.describe('the GitHub button', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // Nothing here goes out to GitHub: its pages are answered from the test.
  const offline = (context) => context.route('https://github.com/**', (route) => route.fulfill({ contentType: 'text/html', body: '<title>repo</title>' }));

  test('each card has See details and View on GitHub side by side, in that order', async ({ page }) => {
    await page.goto('/#projects');
    for (const card of await page.locator('.proj').all()) {
      const actions = card.locator('.proj-actions').locator('> *');
      await expect(actions).toHaveCount(2);
      await expect(actions.nth(0)).toContainText('See details');
      await expect(actions.nth(1)).toContainText('View on GitHub');
      const first = await actions.nth(0).boundingBox();
      const second = await actions.nth(1).boundingBox();
      expect(second.x, 'side by side').toBeGreaterThan(first.x + first.width);
      expect(Math.abs(second.y - first.y), 'on one line').toBeLessThan(6);
      expect(Math.abs(second.height - first.height), 'the same height').toBeLessThan(4);
    }
  });

  test('the Folio link goes to the repository, in a new tab, and does not open the card', async ({ page, context }) => {
    await offline(context);
    await page.goto('/#projects');
    const link = page.getByRole('link', { name: /View on GitHub: Folio Digital Wallet/ });
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveAttribute('href', REPO);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
    expect(popup.url()).toBe(REPO);
    await popup.close();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/#projects$/);
  });

  test('a click on the card still opens it, but a click on the link does not', async ({ page, context }) => {
    await offline(context);
    await page.goto('/#projects');
    const card = page.locator('.proj').nth(1);
    await card.scrollIntoViewIfNeeded();
    const box = await card.locator('.desc').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    const link = await card.getByRole('link', { name: /View on GitHub/ }).boundingBox();
    const [popup] = await Promise.all([context.waitForEvent('page'), page.mouse.click(link.x + link.width / 2, link.y + link.height / 2)]);
    await popup.close();
    await expect(dialog(page)).toHaveCount(0);
  });

  test('GigPilot shows a greyed-out placeholder that cannot be used', async ({ page, context }) => {
    const opened = [];
    context.on('page', (p) => opened.push(p.url()));
    await page.goto('/#projects');
    const placeholder = page.getByRole('button', { name: /View on GitHub: GigPilot \(link coming soon\)/ });
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toBeDisabled();
    await expect(placeholder).toContainText('Soon');
    expect(await placeholder.evaluate((n) => [getComputedStyle(n).cursor, getComputedStyle(n).borderStyle])).toEqual(['not-allowed', 'dashed']);
    await placeholder.click({ force: true });
    await page.waitForTimeout(300);
    expect(opened).toEqual([]);
    expect(await page.getByRole('dialog').count(), 'a click on it does not open the card either').toBe(0);
  });

  test('the keyboard goes from See details straight to View on GitHub', async ({ page }) => {
    await page.goto('/#projects');
    await page.getByRole('button', { name: FOLIO }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /View on GitHub: Folio/ })).toBeFocused();
    expect(await page.getByRole('link', { name: /View on GitHub: Folio/ }).evaluate((n) => getComputedStyle(n).outlineStyle)).toBe('solid');
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.closest('.proj'))).toBeNull();
  });

  test('it is inside the Folio modal too, in the header, and works from there', async ({ page, context }) => {
    await offline(context);
    await open(page);
    const link = dialog(page).getByRole('link', { name: /View on GitHub: Folio Digital Wallet/ });
    await expect(link).toBeVisible();
    await expect(link).toBeInViewport();
    await expect(link).toHaveAttribute('href', REPO);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const head = await dialog(page).locator('.pm-head').boundingBox();
    const box = await link.boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(head.y + head.height);
    const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
    expect(popup.url()).toBe(REPO);
    await popup.close();
    await expect(dialog(page), 'the modal stays open behind the new tab').toBeVisible();
  });

  test('the GigPilot modal has the placeholder too', async ({ page }) => {
    await open(page, GIG, 'GigPilot');
    const placeholder = dialog(page, 'GigPilot').getByRole('button', { name: /View on GitHub: GigPilot \(link coming soon\)/ });
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toBeDisabled();
    await expect(dialog(page, 'GigPilot').getByRole('link', { name: /GitHub/ })).toHaveCount(0);
  });

  test('inside the modal the link is reached by keyboard after the title and before the slides', async ({ page }) => {
    await open(page);
    const order = [];
    for (let i = 0; i < 4; i += 1) {
      order.push(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim().slice(0, 30)));
      await page.keyboard.press('Tab');
    }
    const github = order.findIndex((label) => /View on GitHub/.test(label ?? ''));
    const close = order.findIndex((label) => label === 'Close project details');
    expect(github, 'the link is among the first controls').toBeGreaterThanOrEqual(0);
    expect(close).toBeGreaterThanOrEqual(0);
    const slides = order.findIndex((label) => /Previous slide|Next slide|Send and receive/.test(label ?? ''));
    if (slides >= 0) expect(github).toBeLessThan(slides);
  });

  for (const [name, width, height] of [['tablet', 820, 1100], ['phone', 400, 860], ['small phone', 320, 568]]) {
    test(`${name}: the two card buttons fit, wrap if they must, and nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/#projects');
      for (const card of await page.locator('.proj').all()) {
        await card.scrollIntoViewIfNeeded();
        const open = await card.locator('.proj-open').boundingBox();
        const repo = await card.locator('.repo-link').boundingBox();
        for (const box of [open, repo]) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });

    test(`${name}: the modal header holds the link without crowding the title or the close button`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await open(page);
      const link = await dialog(page).getByRole('link', { name: /View on GitHub/ }).boundingBox();
      const close = await dialog(page).getByRole('button', { name: 'Close project details' }).boundingBox();
      const title = await dialog(page).getByRole('heading', { level: 2 }).boundingBox();
      expect(link.x + link.width).toBeLessThanOrEqual(width);
      expect(link.y, 'under the title').toBeGreaterThanOrEqual(title.y + title.height - 2);
      const clash = link.x < close.x + close.width && link.x + link.width > close.x && link.y < close.y + close.height && link.y + link.height > close.y;
      expect(clash, 'does not overlap the close button').toBe(false);
    });
  }

  for (const theme of ['light', 'dark']) {
    test(`${theme}: both buttons keep their contrast and pass the accessibility audit, on the card and in the modal`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto('/#projects');
      await page.locator('.proj-shot').scrollIntoViewIfNeeded();
      let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await page.getByRole('button', { name: FOLIO }).click();
      await expect(dialog(page)).toBeVisible();
      await page.waitForTimeout(400);
      results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await context.close();
    });
  }

  test('the placeholder in the modal is not in the way: GigPilot opens and closes as before', async ({ page }) => {
    await open(page, GIG, 'GigPilot');
    await page.keyboard.press('Escape');
    await expect(dialog(page, 'GigPilot')).toBeHidden();
    await expect(page.getByRole('button', { name: GIG })).toBeFocused();
  });
});
