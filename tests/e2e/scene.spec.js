import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const themes = ['light', 'dark'];
const clear = 'rgba(0, 0, 0, 0)';

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows grass along the bottom edge and a sword in the corner', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.scene')).toBeVisible();
    const grass = await page.locator('.meadow').boundingBox();
    expect(grass.y + grass.height).toBeCloseTo(800, 0);
    expect(grass.width).toBeGreaterThanOrEqual(1280);

    const sword = await page.locator('svg.sword').boundingBox();
    expect(sword.x + sword.width).toBeLessThanOrEqual(1280);
    expect(sword.x).toBeGreaterThan(1100);
    const gap = 800 - (sword.y + sword.height);
    expect(gap, 'its tip is down inside the grass, above the soil line, deeper than before').toBeGreaterThan(5);
    expect(gap).toBeLessThan(25);
    expect(sword.height).toBeGreaterThan(120);
  });

  test('sits behind the content and never blocks a click', async ({ page }) => {
    await page.goto('/');
    const hit = await page.evaluate(() => {
      const card = document.querySelector('aside.id').getBoundingClientRect();
      const element = document.elementFromPoint(card.x + 60, card.y + 200);
      return { insideScene: !!element.closest('.scene'), insideCard: !!element.closest('aside.id') };
    });
    expect(hit).toEqual({ insideScene: false, insideCard: true });
    expect(await page.locator('.scene').evaluate((node) => getComputedStyle(node).pointerEvents)).toBe('none');

    await page.getByRole('tab', { name: /Experience/ }).click();
    await expect(page).toHaveURL(/#experience$/);
  });

  test('the grass sways evenly: one rhythm for every group, and a regular delay along the field', async ({ page }) => {
    await page.goto('/');
    const info = await page.evaluate(() => {
      const read = (node) => {
        const style = getComputedStyle(node);
        return { name: style.animationName, duration: style.animationDuration, timing: style.animationTimingFunction, delay: parseFloat(style.animationDelay) };
      };
      const front = [...document.querySelectorAll('.tile:first-child .layer.front > .wave')].map(read);
      const back = [...document.querySelectorAll('.tile:first-child .layer.back > .wave')].map(read);
      return { front, back };
    });
    for (const group of [...info.front, ...info.back]) {
      expect(group.name).toBe('sway');
      expect(group.duration).toBe('3.2s');
      expect(group.timing).toBe('ease-in-out');
    }
    for (let i = 1; i < 8; i += 1) expect(info.front[i].delay - info.front[i - 1].delay).toBeCloseTo(-0.18, 2);
    expect(info.back[0].delay).not.toBe(info.front[0].delay);
  });

  test('the blades bend from the ground, evenly and without jumping, and keep moving', async ({ page }) => {
    await page.goto('/');
    const origin = await page.evaluate(() => getComputedStyle(document.querySelector('.layer.front .wave')).transformOrigin);
    expect(origin.split(' ')[1], 'bends from the ground line').toBe('96px');

    const lean = () =>
      page.evaluate(() => ({
        c: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.tile:first-child .layer.front .w0')).transform).c,
        t: performance.now(),
      }));
    const seen = [];
    for (let i = 0; i < 40; i += 1) {
      seen.push(await lean());
      await page.waitForTimeout(100);
    }
    const values = seen.map((p) => p.c);
    expect(Math.min(...values), 'leans to the right at the peak of a gust').toBeLessThan(-0.05);
    expect(Math.max(...values), 'never leans far to the left').toBeLessThan(0.04);
    expect(Math.min(...values)).toBeGreaterThan(-0.1);
    expect(new Set(values.map((v) => v.toFixed(4))).size, 'many in-between positions').toBeGreaterThan(20);
    for (let i = 1; i < seen.length; i += 1) {
      const speed = Math.abs(seen[i].c - seen[i - 1].c) / ((seen[i].t - seen[i - 1].t) / 1000);
      expect(speed, 'a steady, even sway: no sudden jumps').toBeLessThan(0.35);
    }
  });

  test('a gust travels: groups in different places are out of step, and the back row is out of step with the front', async ({ page }) => {
    await page.goto('/');
    const delays = await page.evaluate(() => {
      const pick = (selector) => getComputedStyle(document.querySelector(selector)).animationDelay;
      return {
        front: [pick('.layer.front .w0'), pick('.layer.front .w3'), pick('.layer.front .w6')],
        back: pick('.layer.back .w0'),
      };
    });
    expect(new Set(delays.front).size).toBe(3);
    expect(delays.back).not.toBe(delays.front[0]);
  });

  test('stands still when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.scene')).toBeVisible();
    const name = await page.evaluate(() => getComputedStyle(document.querySelector('.layer.front .wave')).animationName);
    expect(name).toBe('none');
  });

  test('adds no scrolling, no overflow and no console errors', async ({ page }) => {
    const problems = [];
    page.on('console', (msg) => msg.type() === 'error' && problems.push(msg.text()));
    page.on('pageerror', (err) => problems.push(err.message));
    await page.goto('/');
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      y: document.documentElement.scrollHeight - innerHeight,
    }));
    expect(metrics.x).toBeLessThanOrEqual(0);
    expect(metrics.y).toBeLessThanOrEqual(0);
    expect(problems).toEqual([]);
  });

  test('keeps the cards above the scene', async ({ page }) => {
    await page.goto('/');
    const layers = await page.evaluate(() => {
      const scene = getComputedStyle(document.querySelector('.scene'));
      const shell = getComputedStyle(document.querySelector('.shell'));
      return { sceneFixed: scene.position === 'fixed', sceneZ: Number(scene.zIndex), shellZ: Number(shell.zIndex) };
    });
    expect(layers.sceneFixed).toBe(true);
    expect(layers.shellZ).toBeGreaterThan(layers.sceneZ);
  });

  test('the footer line stays legible over the grass', async ({ page }) => {
    await page.goto('/');
    const foot = await page.locator('.foot').evaluate((node) => ({
      background: getComputedStyle(node).backgroundColor,
      width: node.getBoundingClientRect().width,
    }));
    expect(foot.background).not.toBe(clear);
    expect(foot.width).toBeLessThan(400);
  });
});

for (const theme of themes) {
  test(`${theme}: passes the accessibility audit with the scene showing`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1600, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    ).toEqual([]);
    await context.close();
  });

  test(`${theme}: the grass and the sword take their colours from the theme`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto('/');
    const colours = await page.evaluate(() => ({
      grass: getComputedStyle(document.querySelector('.layer.front .c1')).fill,
      soil: getComputedStyle(document.querySelector('.soil')).fill,
      steel: getComputedStyle(document.querySelector('.sword .p-steel')).fill,
      wrap: getComputedStyle(document.querySelector('.sword .p-wrap')).fill,
    }));
    for (const value of Object.values(colours)) expect(value).toMatch(/^rgb/);
    expect(new Set(Object.values(colours)).size).toBe(4);
    await context.close();
  });
}

test.describe('not shown where it does not belong', () => {
  test('hidden on a phone, so nothing is drawn or animated there', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 860 });
    await page.goto('/');
    await expect(page.locator('.scene')).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.scene')).display)).toBe('none');
  });

  test('hidden on a tablet in portrait', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1100 });
    await page.goto('/');
    await expect(page.locator('.scene')).toBeHidden();
  });

  test('on a small laptop the grass shows but the sword waits for a wider window', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 750 });
    await page.goto('/');
    await expect(page.locator('.meadow')).toBeVisible();
    await expect(page.locator('svg.sword')).toBeHidden();
  });

  test('on a very wide window the sword is larger and still inside the screen', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    const sword = await page.locator('svg.sword').boundingBox();
    expect(sword.height).toBeGreaterThan(190);
    expect(sword.x + sword.width).toBeLessThanOrEqual(1920);
    const grass = await page.locator('.meadow').boundingBox();
    expect(grass.width).toBeGreaterThanOrEqual(1920);
  });

  test('the grass covers even a very wide window', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1300 });
    await page.goto('/');
    const grass = await page.locator('.meadow').boundingBox();
    expect(grass.width).toBeGreaterThanOrEqual(2560);
  });
});

test.describe('katana', () => {
  test('is planted in the corner of the grass from 1280px wide, inside the screen', async ({ page }) => {
    for (const width of [1280, 1500, 1920, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      const sword = await page.locator('svg.sword').boundingBox();
      expect(sword.x + sword.width, `at ${width}px`).toBeLessThanOrEqual(width);
      expect(sword.x).toBeGreaterThan(width - 500);
      const gap = 1000 - (sword.y + sword.height);
      expect(gap, 'its tip is down inside the grass, deeper than before').toBeGreaterThan(5);
      expect(gap).toBeLessThan(25);
    }
  });

  test('is hidden below 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.locator('svg.sword')).toBeHidden();
  });

  test('the pixels are 1px up to 1900 wide and 1.5px above, so the art is fine-grained', async ({ page }) => {
    await page.setViewportSize({ width: 1700, height: 900 });
    await page.goto('/');
    const small = await page.locator('svg.sword').boundingBox();
    expect(small.width).toBeCloseTo(80, 0);
    expect(small.height).toBeCloseTo(132, 0);
    await page.setViewportSize({ width: 1920, height: 1000 });
    const large = await page.locator('svg.sword').boundingBox();
    expect(large.width).toBeCloseTo(120, 0);
    expect(large.height).toBeCloseTo(198, 0);
  });

  test('it stands in the margin: the hilt and the guard are clear of the content', async ({ page }) => {
    for (const width of [1280, 1360, 1600, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      const sword = await page.locator('svg.sword').boundingBox();
      const card = await page.locator('.sheet').boundingBox();
      // The hilt leans to the right, so the middle of the drawing is always clear of the card.
      expect(sword.x + sword.width * 0.5, `at ${width}px`).toBeGreaterThanOrEqual(card.x + card.width);
    }
  });

  test('there is nothing else in the scene: no samurai, tree, cup, leaves or butterflies', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    expect(await page.locator('.camp, .tree, .leaf, .steam, .ponytail, .butterfly').count()).toBe(0);
    expect(await page.locator('.scene svg.tile, .scene svg.sword').count(), 'six grass tiles and the katana').toBe(7);
  });

  test('is hidden from assistive tech and never takes a click', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    expect(await page.locator('.scene').getAttribute('aria-hidden')).toBe('true');
    const sword = await page.locator('svg.sword').boundingBox();
    const hit = await page.evaluate(
      ([x, y]) => !document.elementFromPoint(x, y)?.closest('.scene'),
      [sword.x + sword.width / 2, sword.y + sword.height / 2],
    );
    expect(hit, 'a click on the katana reaches the page, not the drawing').toBe(true);
    expect(await page.locator('.scene').evaluate((node) => getComputedStyle(node).pointerEvents)).toBe('none');
  });

  test('the tip is buried: grass stands in front of the bottom of the blade, and is drawn after it', async ({ page }) => {
    for (const width of [1600, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      // The lowest pixels of the blade itself, taken from the drawing, should all sit behind a blade of grass.
      const hidden = await page.evaluate(() => {
        const blade = [...document.querySelectorAll('.sword .p-steel, .sword .p-steel-edge, .sword .p-steel-shade, .sword .p-hamon')]
          .map((rect) => rect.getBoundingClientRect())
          .sort((a, b) => b.bottom - a.bottom);
        const grass = [...document.querySelectorAll('.meadow path')].map((rect) => rect.getBoundingClientRect());
        const covered = (box) => {
          const x = box.left + box.width / 2;
          const y = box.top + box.height / 2;
          return grass.some((g) => g.left <= x && g.right >= x && g.top <= y && g.bottom >= y);
        };
        return [blade[0], blade[2], blade[4]].map(covered);
      });
      expect(hidden, `at ${width}px the lowest blade pixels are covered by grass`).toEqual([true, true, true]);
      const order = await page.evaluate(() => [...document.querySelectorAll('.scene .vignette, .scene .meadow')].map((n) => n.className));
      const stacking = await page.evaluate(() => {
        const style = getComputedStyle(document.querySelector('svg.sword'));
        return { position: style.position, zIndex: style.zIndex };
      });
      expect(stacking, 'the katana is not lifted above the grass').toEqual({ position: 'static', zIndex: 'auto' });
      expect(order, 'the grass is drawn after, so in front of, the sword').toEqual(['vignette', 'meadow']);
    }
  });

  test('on screen the katana is a straight line, planted at 60 degrees and leaning to the right', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    const fit = await page.locator('svg.sword').evaluate((node) => {
      const rows = new Map();
      for (const rect of node.querySelectorAll('.p-steel, .p-steel-edge, .p-steel-shade, .p-hamon')) {
        const y = Number(rect.getAttribute('y'));
        const x = Number(rect.getAttribute('x'));
        const w = Number(rect.getAttribute('width'));
        const row = rows.get(y) ?? [Infinity, -Infinity];
        rows.set(y, [Math.min(row[0], x), Math.max(row[1], x + w)]);
      }
      // The middle of the blade in each row, leaving out the first rows and the tapering tip.
      const points = [...rows.entries()].sort((a, b) => a[0] - b[0]).slice(10, -6).map(([y, [lo, hi]]) => [y, (lo + hi) / 2]);
      const n = points.length;
      const my = points.reduce((t, p) => t + p[0], 0) / n;
      const mx = points.reduce((t, p) => t + p[1], 0) / n;
      const sxy = points.reduce((t, p) => t + (p[0] - my) * (p[1] - mx), 0);
      const syy = points.reduce((t, p) => t + (p[0] - my) ** 2, 0);
      const sxx = points.reduce((t, p) => t + (p[1] - mx) ** 2, 0);
      const slope = sxy / syy;
      return { slope, r2: (sxy * sxy) / (syy * sxx), angle: (Math.atan(1 / Math.abs(slope)) * 180) / Math.PI };
    });
    expect(fit.slope, 'the hilt is to the right of the tip').toBeLessThan(0);
    expect(fit.angle).toBeGreaterThan(57);
    expect(fit.angle).toBeLessThan(63);
    expect(fit.r2, 'straight, not curved').toBeGreaterThan(0.995);
  });

  for (const theme of ['light', 'dark']) {
    test(`${theme}: the katana stands out from the background`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1920, height: 1000 } });
      const page = await context.newPage();
      await page.goto('/');
      const colours = await page.evaluate(() => {
        const fill = (selector) => getComputedStyle(document.querySelector(selector)).fill;
        return {
          ink: fill('.sword .p-ink'),
          steel: fill('.sword .p-steel'),
          edge: fill('.sword .p-steel-edge'),
          shade: fill('.sword .p-steel-shade'),
          wrap: fill('.sword .p-wrap'),
          fitting: fill('.sword .p-fitting'),
          grip: fill('.sword .p-grip'),
          page: getComputedStyle(document.body).backgroundColor,
        };
      });
      for (const value of Object.values(colours)) expect(value).toMatch(/^rgb/);
      expect(colours.ink, 'the outline differs from the page').not.toBe(colours.page);
      expect(colours.steel).not.toBe(colours.page);
      expect(new Set(Object.values(colours)).size).toBe(8);
      await context.close();
    });
  }
});

test('the scene pauses while the resume is open and moves again afterwards', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const state = () => page.evaluate(() => getComputedStyle(document.querySelector('.layer.front .wave')).animationPlayState);
  expect(await state()).toBe('running');
  await page.getByRole('button', { name: /View resume/ }).click();
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible();
  expect(await state()).toBe('paused');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeHidden();
  expect(await state()).toBe('running');
});

test.describe('thick grass', () => {
  test.use({ viewport: { width: 1920, height: 1000 } });

  test('no ground shows between the blades: checked on a real screenshot of the bottom edge', async ({ browser }) => {
    // Light mode, so the fireflies cannot colour any gap.
    const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1920, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(600);
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const shot = await page.screenshot({ clip: { x: 0, y: 1000 - 24, width: 1920, height: 24 } });
    const bare = await page.evaluate(
      async ([base64, css]) => {
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
        const [r, g, b] = css.match(/\d+/g).map(Number);
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (Math.hypot(data[i] - r, data[i + 1] - g, data[i + 2] - b) < 26) count += 1;
        }
        return { count, pixels: bitmap.width * bitmap.height };
      },
      [shot.toString('base64'), background],
    );
    expect(bare.count, 'pixels the colour of the page, in the lowest 24px').toBe(0);
    await context.close();
  });

  test('the meadow is thick but not heaped: a back row rises above the front row', async ({ page }) => {
    await page.goto('/');
    const tops = await page.evaluate(() => {
      const top = (selector) => Math.min(...[...document.querySelectorAll(selector)].map((r) => r.getBoundingClientRect().top));
      return { back: top('.layer.back path'), front: top('.layer.front path') };
    });
    expect(tops.back).toBeLessThan(tops.front);
    const meadow = await page.locator('.meadow').boundingBox();
    expect(meadow.height, 'a little lower than before').toBeGreaterThanOrEqual(90);
    expect(meadow.height).toBeLessThanOrEqual(100);
  });

  test('the blades are thin and sharp, drawn crisp like the katana', async ({ page }) => {
    await page.goto('/');
    const look = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll('.tile:first-child .layer.front path')].map((p) => p.getBoundingClientRect());
      const ratios = boxes.map((b) => b.height / b.width).sort((a, b) => a - b);
      return {
        count: boxes.length,
        widest: Math.max(...boxes.map((b) => b.width)),
        median: ratios[Math.floor(ratios.length / 2)],
        rendering: getComputedStyle(document.querySelector('.layer.front path')).shapeRendering,
      };
    });
    expect(look.count, 'plenty of fine blades').toBeGreaterThan(120);
    expect(look.widest, 'no wide blocks').toBeLessThanOrEqual(16);
    expect(look.median, 'slender: several times taller than wide').toBeGreaterThan(3.5);
    expect(look.rendering.toLowerCase()).toBe('crispedges');
  });

  test('the back row is darker than the front row', async ({ page }) => {
    await page.goto('/');
    const luminance = await page.evaluate(() => {
      const lum = (css) => {
        const [r, g, b] = css.match(/\d+(\.\d+)?/g).map(Number);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const fill = (selector) => lum(getComputedStyle(document.querySelector(selector)).fill);
      return { back: fill('.layer.back .c1'), front: fill('.layer.front .c1') };
    });
    expect(luminance.back).toBeLessThan(luminance.front);
  });
});

test.describe('dull katana', () => {
  test.use({ viewport: { width: 1920, height: 1000 } });

  for (const theme of ['light', 'dark']) {
    test(`${theme}: it is grey and greyish-blue, with no shine and no warm colours`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1920, height: 1000 } });
      const page = await context.newPage();
      await page.goto('/');
      const colours = await page.evaluate(() => {
        const out = {};
        for (const name of ['steel', 'steel-edge', 'steel-shade', 'hamon', 'fitting', 'fitting-lt', 'fitting-dk', 'wrap', 'wrap-dk', 'wrap-lt', 'grip', 'grip-lt']) {
          const node = document.querySelector(`.sword .p-${name}`);
          if (node) out[name] = getComputedStyle(node).fill;
        }
        return out;
      });
      const parse = (css) => css.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
      expect(Object.keys(colours).length).toBeGreaterThanOrEqual(10);
      for (const [name, css] of Object.entries(colours)) {
        const [r, g, b] = parse(css);
        const brightest = Math.max(r, g, b);
        const spread = brightest - Math.min(r, g, b);
        expect(brightest, `${name} is not bright or glossy`).toBeLessThan(200);
        expect(b, `${name} leans cool, never warm`).toBeGreaterThanOrEqual(r);
        expect(spread, `${name} stays greyish`).toBeLessThan(75);
      }
      await context.close();
    });
  }
});

test.describe('fireflies', () => {
  const flies = (page) => page.locator('.firefly');
  const dark = { colorScheme: 'dark', viewport: { width: 1920, height: 1000 } };

  test('in dark mode nine tiny glowing fireflies drift around the katana', async ({ browser }) => {
    const context = await browser.newContext(dark);
    const page = await context.newPage();
    await page.goto('/');
    await expect(flies(page)).toHaveCount(9);
    for (let i = 0; i < 9; i += 1) await expect(flies(page).nth(i)).toBeVisible();
    const sword = await page.locator('svg.sword').boundingBox();
    const boxes = await flies(page).evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().toJSON()));
    for (const box of boxes) {
      expect(box.x, 'near the katana').toBeGreaterThan(sword.x - 90);
      expect(box.x).toBeLessThan(sword.x + sword.width + 90);
      expect(box.y).toBeGreaterThan(sword.y - 70);
      expect(box.y).toBeLessThan(sword.y + sword.height + 70);
    }
    await context.close();
  });

  test('they are really small next to the katana, and soft: no pixels', async ({ browser }) => {
    const context = await browser.newContext(dark);
    const page = await context.newPage();
    await page.goto('/');
    const sword = await page.locator('svg.sword').boundingBox();
    const looks = await flies(page).evaluateAll((nodes) =>
      nodes.map((n) => {
        const style = getComputedStyle(n);
        return { width: parseFloat(style.width), height: parseFloat(style.height), radius: style.borderRadius, shadow: style.boxShadow };
      }),
    );
    for (const look of looks) {
      expect(look.width, 'tiny').toBeLessThanOrEqual(4);
      expect(look.width).toBeLessThan(sword.width * 0.06);
      expect(look.height).toBeLessThanOrEqual(4);
      expect(look.radius, 'round, not a square pixel').toMatch(/50%|\d+px/);
      expect(look.shadow, 'has a soft halo').not.toBe('none');
    }
    await context.close();
  });

  test('the glow is soft: a dim halo, and the dot is never at full strength', async ({ browser }) => {
    const context = await browser.newContext(dark);
    const page = await context.newPage();
    await page.goto('/');
    const glow = await flies(page).first().evaluate((node) => {
      const style = getComputedStyle(node);
      // The browser may write the halo as rgba(...) or as color(srgb r g b / alpha).
      const alphas = [...style.boxShadow.matchAll(/(?:rgba?|color)\([^)]*\)/g)].map((m) => {
        const text = m[0];
        if (text.includes('/')) return Number(text.split('/')[1].replace(')', '').trim());
        const parts = text.match(/[\d.]+/g).map(Number);
        return parts.length > 3 ? parts[3] : 1;
      });
      return { alphas, background: style.backgroundColor };
    });
    expect(glow.alphas.length).toBeGreaterThanOrEqual(2);
    for (const alpha of glow.alphas) expect(alpha, 'halo is faint').toBeLessThanOrEqual(0.45);
    const [r, g, b] = glow.background.match(/\d+/g).map(Number);
    expect(Math.min(r, g, b), 'a warm, yellow-green tint, not white').toBeLessThan(200);
    expect(g).toBeGreaterThan(b + 40);

    const seen = [];
    for (let i = 0; i < 20; i += 1) {
      seen.push(await flies(page).first().evaluate((node) => Number(getComputedStyle(node).opacity)));
      await page.waitForTimeout(250);
    }
    expect(Math.max(...seen), 'never at full strength').toBeLessThanOrEqual(0.95);
    expect(Math.max(...seen) - Math.min(...seen), 'they pulse').toBeGreaterThan(0.2);
    await context.close();
  });

  test('they move smoothly (eased, not stepped) and keep moving', async ({ browser }) => {
    const context = await browser.newContext(dark);
    const page = await context.newPage();
    await page.goto('/');
    const timing = await flies(page).first().evaluate((node) => getComputedStyle(node).animationTimingFunction);
    expect(timing).toContain('ease-in-out');
    expect(timing).not.toContain('steps');

    const where = () => flies(page).first().evaluate((node) => {
      const box = node.getBoundingClientRect();
      return [box.x, box.y];
    });
    const trail = [];
    for (let i = 0; i < 10; i += 1) {
      trail.push(await where());
      await page.waitForTimeout(400);
    }
    const spread = Math.max(...trail.map((p) => p[0])) - Math.min(...trail.map((p) => p[0]));
    expect(spread, 'it travels').toBeGreaterThan(4);
    const fractional = trail.some(([x, y]) => Math.abs(x - Math.round(x)) > 0.05 || Math.abs(y - Math.round(y)) > 0.05);
    expect(fractional, 'in-between positions: smooth').toBe(true);
    await context.close();
  });

  test('each one has its own path and rhythm', async ({ browser }) => {
    const context = await browser.newContext(dark);
    const page = await context.newPage();
    await page.goto('/');
    const rhythms = await flies(page).evaluateAll((nodes) =>
      nodes.map((n) => {
        const style = getComputedStyle(n);
        return `${style.animationName}|${style.animationDuration}|${style.animationDelay}`;
      }),
    );
    expect(new Set(rhythms).size).toBe(9);
    await context.close();
  });

  test('they are not there in light mode', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1920, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/');
    for (let i = 0; i < 9; i += 1) await expect(flies(page).nth(i)).toBeHidden();
    expect(await flies(page).first().evaluate((n) => getComputedStyle(n).display)).toBe('none');
    await context.close();
  });

  test('switching the theme shows and hides them straight away', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1920, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/');
    await expect(flies(page).first()).toBeHidden();
    await page.getByRole('button', { name: /Switch to dark theme/ }).click();
    await expect(flies(page).first()).toBeVisible();
    await page.getByRole('button', { name: /Switch to light theme/ }).click();
    await expect(flies(page).first()).toBeHidden();
    await context.close();
  });

  test('a saved dark theme brings them back after a reload, even on a light system', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1920, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/');
    await page.getByRole('button', { name: /Switch to dark theme/ }).click();
    await page.reload();
    await expect(flies(page).first()).toBeVisible();
    await context.close();
  });

  test('they are only where the katana is: gone on a phone and on a small window', async ({ browser }) => {
    for (const width of [400, 1200]) {
      const context = await browser.newContext({ colorScheme: 'dark', viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto('/');
      await expect(flies(page).first(), `at ${width}px`).toBeHidden();
      await context.close();
    }
  });

  test('they stand still for reduced motion, and pause while the resume is open', async ({ browser }) => {
    const context = await browser.newContext({ ...dark, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const names = await flies(page).first().evaluate((n) => getComputedStyle(n).animationName);
    expect(names).toBe('none');
    await context.close();

    const second = await browser.newContext(dark);
    const view = await second.newPage();
    await view.goto('/');
    const state = () => flies(view).first().evaluate((n) => getComputedStyle(n).animationPlayState);
    expect(await state()).toContain('running');
    await view.getByRole('button', { name: /View resume/ }).click();
    await expect(view.getByRole('dialog', { name: 'Resume' })).toBeVisible();
    expect(await state()).toContain('paused');
    await second.close();
  });

  test('they never take a click, and the page has no errors or overflow with them', async ({ browser }) => {
    const context = await browser.newContext(dark);
    const page = await context.newPage();
    const problems = [];
    page.on('console', (msg) => msg.type() === 'error' && problems.push(msg.text()));
    page.on('pageerror', (err) => problems.push(err.message));
    await page.goto('/');
    await page.waitForTimeout(800);
    expect(await flies(page).first().evaluate((n) => getComputedStyle(n).pointerEvents)).toBe('none');
    const hidden = await page.locator('.scene').getAttribute('aria-hidden');
    expect(hidden).toBe('true');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(problems).toEqual([]);
    await context.close();
  });
});

test.describe('light mode: just the katana in the grass', () => {
  test('there are no butterflies, and the katana is behind the grass', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1920, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.butterfly')).toHaveCount(0);
    for (let i = 0; i < 9; i += 1) await expect(page.locator('.firefly').nth(i)).toBeHidden();
    await expect(page.locator('svg.sword')).toBeVisible();

    // Take the blade pixel nearest the ground and a point just in front of it: a blade of grass covers it.
    const covered = await page.evaluate(() => {
      const blade = [...document.querySelectorAll('.sword .p-steel, .sword .p-steel-edge, .sword .p-steel-shade, .sword .p-hamon')]
        .map((r) => r.getBoundingClientRect())
        .sort((a, b) => b.bottom - a.bottom)[0];
      const x = blade.left + blade.width / 2;
      const y = blade.top + blade.height / 2;
      const stack = document.elementsFromPoint(x, y);
      return { top: stack[0]?.tagName, hasGrass: stack.some((n) => n.closest?.('.meadow')) };
    });
    // Everything in the scene ignores the pointer, so ask the stacking order directly instead.
    const order = await page.evaluate(() => {
      const sword = document.querySelector('svg.sword');
      const grass = document.querySelector('.meadow');
      return Boolean(sword.compareDocumentPosition(grass) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order, 'the grass is after the katana in the page, so it is drawn on top').toBe(true);
    expect(covered.top).not.toBe('svg');
    await context.close();
  });

  test('the dark mode fireflies are still there', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1920, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.firefly').first()).toBeVisible();
    await expect(page.locator('.butterfly')).toHaveCount(0);
    await context.close();
  });
});

test('the katana is planted deeper: less of the blade shows above the grass than before', async ({ browser }) => {
  for (const [width, lift] of [[1600, 8], [1920, 12]]) {
    const context = await browser.newContext({ colorScheme: 'light', viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/');
    const sword = await page.locator('svg.sword').boundingBox();
    expect(1000 - (sword.y + sword.height), `at ${width}px the tip is ${lift}px above the bottom edge`).toBeCloseTo(lift, 0);
    const sunk = await page.evaluate(() => {
      const grassTops = [...document.querySelectorAll('.layer.front path')].map((p) => p.getBoundingClientRect().top);
      const blade = [...document.querySelectorAll('.sword .p-steel, .sword .p-steel-edge, .sword .p-steel-shade, .sword .p-hamon')].map((r) => r.getBoundingClientRect());
      const tip = Math.max(...blade.map((b) => b.bottom));
      const front = grassTops.sort((a, b) => a - b)[Math.floor(grassTops.length / 2)];
      return { tip, front };
    });
    expect(sunk.tip, 'the tip is well below the usual top of the front grass').toBeGreaterThan(sunk.front + 15);
    await context.close();
  }
});
