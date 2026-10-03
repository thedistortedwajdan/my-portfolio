import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../src/App.jsx';
import Scene, { FIREFLIES, SIZES, TILE_H, TILE_W, WAVE_WIDTH } from '../../src/components/Scene.jsx';
import { KATANA, KATANA_H, KATANA_W, PALETTE } from '../../src/components/sprites.js';

describe('pixel scene', () => {
  it('is hidden from assistive tech and has nothing to focus or click', () => {
    const { container } = render(<Scene />);
    const scene = container.querySelector('.scene');
    expect(scene).toHaveAttribute('aria-hidden', 'true');
    expect(scene.querySelectorAll('a, button, input, [tabindex], [role]')).toHaveLength(0);
    expect(scene.textContent).toBe('');
  });

  it('draws grass tiles and a katana out of plain rects, with no inline styles', () => {
    const { container } = render(<Scene />);
    expect(container.querySelectorAll('.tile')).toHaveLength(6);
    expect(container.querySelectorAll('.layer.back')).toHaveLength(6);
    expect(container.querySelectorAll('.layer.front')).toHaveLength(6);
    expect(container.querySelectorAll('.layer path').length).toBeGreaterThan(1200);
    expect(container.querySelectorAll('.sword rect').length).toBeGreaterThan(100);
    for (const node of container.querySelectorAll('*')) {
      expect(node.getAttribute('style')).toBeNull();
    }
  });

  it('has the katana and the grass, and nothing else', () => {
    const { container } = render(<Scene />);
    expect(container.querySelectorAll('.sword')).toHaveLength(1);
    expect(container.querySelectorAll('.meadow')).toHaveLength(1);
    for (const gone of ['.camp', '.tree', '.leaf', '.steam', '.ponytail']) {
      expect(container.querySelector(gone), `${gone} should be gone`).toBeNull();
    }
  });

  it('has nine fireflies, drawn as soft dots rather than pixels, inside the hidden scene', () => {
    const { container } = render(<Scene />);
    const flies = container.querySelectorAll('.vignette .firefly');
    expect(FIREFLIES).toBe(9);
    expect(flies).toHaveLength(9);
    for (const fly of flies) {
      expect(fly.tagName).toBe('I');
      expect(fly.textContent).toBe('');
      expect(fly.closest('[aria-hidden="true"]')).not.toBeNull();
      expect(fly.getAttribute('class')).toMatch(/\bf[0-8]\b/);
    }
    expect(new Set([...flies].map((f) => f.getAttribute('class'))).size).toBe(9);
  });

  it('gives every firefly its own place and rhythm in the stylesheet, and shows them in dark mode only', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    for (let i = 0; i < 9; i += 1) {
      const rule = new RegExp(`\\.firefly\\.f${i} \\{[^}]*--x:[^}]*--y:[^}]*--dur:[^}]*--blink:[^}]*\\}`);
      expect(css, `rule for firefly ${i}`).toMatch(rule);
    }
    expect(css).toMatch(/\.firefly \{\s*display: none;/);
    expect(css).toMatch(/prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme='light'\]\) \.firefly \{\s*display: block;/);
    expect(css).toMatch(/:root\[data-theme='dark'\] \.firefly \{\s*display: block;/);
  });

  it('has no butterflies: in light mode the scene is just the katana in the grass', () => {
    const { container } = render(<Scene />);
    expect(container.querySelectorAll('.butterfly')).toHaveLength(0);
    expect(container.querySelectorAll('radialGradient')).toHaveLength(0);
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).not.toMatch(/butterfl|bf-|--bf-/);
  });

  it('draws the katana behind the grass, so the blade goes down into it', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    const sword = css.match(/\.sword \{[^}]*\}/)[0];
    expect(sword).not.toMatch(/position:|z-index:/);
    const { container } = render(<Scene />);
    const order = [...container.querySelectorAll('.scene > *')].map((node) => node.getAttribute('class'));
    expect(order, 'the grass comes after the katana in the scene').toEqual(['vignette', 'meadow']);
  });

  it('draws the same meadow every time', () => {
    const first = render(<Scene />).container.innerHTML;
    const second = render(<Scene />).container.innerHTML;
    expect(second).toBe(first);
  });

  const css = readFileSync('src/styles.css', 'utf8');
  // A blade is `M x g Q cx cy tipX tipY Q cx2 cy2 x2 g Z`: a root from x to x2 and a point at the top.
  const bladesOf = (container, name, tile = 0) =>
    [...container.querySelectorAll('.tile')[tile].querySelectorAll(`.layer.${name} path`)].map((path) => {
      const n = path.getAttribute('d').match(/-?[\d.]+/g).map(Number);
      const group = path.closest('.wave').getAttribute('class').match(/\bw(\d)\b/)[1];
      return { x0: n[0], ground: n[1], tipX: n[4], tipY: n[5], x1: n[8], width: n[8] - n[0], height: n[1] - n[5], wave: Number(group), curves: (path.getAttribute('d').match(/Q/g) ?? []).length };
    });

  it('draws the grass at the katana\'s fine grain: one unit is one pixel', () => {
    const tile = css.match(/\.tile \{[^}]*\}/)[0];
    expect(Number(/width:\s*(\d+)px/.exec(tile)[1])).toBe(TILE_W);
    expect(Number(/height:\s*(\d+)px/.exec(tile)[1])).toBe(TILE_H);
    const { container } = render(<Scene />);
    expect(container.querySelector('.tile').getAttribute('viewBox')).toBe(`0 0 ${TILE_W} ${TILE_H}`);
  });

  it('sways in eight groups per row, so only a few elements animate', () => {
    const { container } = render(<Scene />);
    expect(container.querySelectorAll('.wave')).toHaveLength(6 * 2 * 8);
    for (const name of ['front', 'back']) {
      const groups = [...container.querySelectorAll('.tile')[0].querySelectorAll(`.layer.${name} > .wave`)];
      expect(groups).toHaveLength(8);
      groups.forEach((group, i) => {
        expect(group.getAttribute('class')).toContain(`w${i}`);
        expect(group.querySelectorAll('path').length).toBeGreaterThan(8);
      });
    }
  });

  it('puts neighbouring blades in neighbouring groups, so the gust travels along the grass', () => {
    const { container } = render(<Scene />);
    for (const blade of bladesOf(container, 'front')) {
      const expected = ((Math.floor(blade.x0 / WAVE_WIDTH) % 8) + 8) % 8;
      const gap = Math.abs(blade.wave - expected);
      expect(Math.min(gap, 8 - gap), `blade at ${blade.x0}`).toBeLessThanOrEqual(1);
    }
    expect(WAVE_WIDTH * 8 * 3).toBe(TILE_W);
  });

  it('leaves no bare ground: the roots overlap across the whole width, in both rows', () => {
    const { container } = render(<Scene />);
    for (const name of ['front', 'back']) {
      const blades = bladesOf(container, name);
      for (let column = 0; column < TILE_W; column += 1) {
        expect(blades.some((b) => b.x0 <= column + 0.5 && b.x1 >= column + 0.5), `${name} row, column ${column}`).toBe(true);
      }
    }
    expect(container.querySelector('.soil').getAttribute('width')).toBe(String(TILE_W));
    const under = container.querySelector('.under');
    expect(under.getAttribute('width')).toBe(String(TILE_W));
    expect(Number(under.getAttribute('height')), 'undergrowth fills the lowest 28 units').toBeGreaterThanOrEqual(26);
  });

  it('is made of thin, sharp blades: slender, tapering to a point, never blocks', () => {
    const { container } = render(<Scene />);
    for (const name of ['front', 'back']) {
      const blades = bladesOf(container, name);
      const widths = blades.map((b) => b.width);
      const ratios = blades.map((b) => b.height / b.width);
      expect(Math.max(...widths), `${name} blades are slim`).toBeLessThanOrEqual(8);
      expect(Math.min(...widths)).toBeGreaterThanOrEqual(4);
      expect(Math.min(...blades.map((b) => b.height))).toBeGreaterThanOrEqual(22);
      expect([...ratios].sort((a, b) => a - b)[Math.floor(ratios.length / 2)], 'median blade is several times taller than wide').toBeGreaterThanOrEqual(5);
      for (const blade of blades) expect(blade.curves, 'two curved edges meeting at one point').toBe(2);
    }
  });

  it('is thick: a darker back row stands taller than the front row', () => {
    const { container } = render(<Scene />);
    const front = bladesOf(container, 'front');
    const back = bladesOf(container, 'back');
    expect(Math.max(...back.map((b) => b.height))).toBeGreaterThan(Math.max(...front.map((b) => b.height)));
    expect(Math.min(...back.map((b) => b.height))).toBeGreaterThan(Math.min(...front.map((b) => b.height)));
  });

  it('bends every blade from the ground with one even rhythm and a regular delay between neighbours', () => {
    expect(css).toMatch(/@keyframes sway \{[^}]*skewX/);
    const wave = css.match(/\.wave \{[^}]*\}/)[0];
    expect(wave).toContain('transform-origin: 0 96px');
    expect(wave).toMatch(/animation: sway 3\.2s ease-in-out infinite/);
    const delays = [...css.matchAll(/\.w(\d) \{\s*--d: (-?[\d.]+)s;/g)].map((m) => [Number(m[1]), Number(m[2])]).sort((a, b) => a[0] - b[0]);
    expect(delays).toHaveLength(8);
    for (let i = 1; i < 8; i += 1) expect(delays[i][1] - delays[i - 1][1]).toBeCloseTo(-0.18, 5);
  });

  it('sits beside the page without changing what it says', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.scene')).not.toBeNull();
    expect(container.querySelector('.shell')).not.toBeNull();
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });
});

describe('katana sprite', () => {
  const css = readFileSync('src/styles.css', 'utf8');
  const number = (name) => Number(new RegExp(`--${name}:\\s*(\\d+);`).exec(css)[1]);
  it('keeps the sizes in the stylesheet in step with the drawing', () => {
    expect(number('sword-w')).toBe(SIZES.swordW);
    expect(number('sword-h')).toBe(SIZES.swordH);
  });

  it('is drawn on a clean rectangle of the size it claims', () => {
    expect(KATANA).toHaveLength(KATANA_H);
    for (const row of KATANA) {
      expect(row).toHaveLength(KATANA_W);
      expect(row).toMatch(/^[.A-Za-z]*$/);
    }
  });

  it('uses only colours that have a name, a class, and a light and a dark value', () => {
    const used = new Set(KATANA.join('').split('').filter((ch) => ch !== '.'));
    for (const ch of used) {
      const name = PALETTE[ch];
      expect(name, `palette entry for "${ch}"`).toBeTruthy();
      expect(css, `.p-${name} class`).toContain(`.p-${name} {`);
      expect(css.match(new RegExp(`--px-${name}:`, 'g')).length, `light and dark value for ${name}`).toBeGreaterThanOrEqual(3);
    }
    for (const ch of Object.keys(PALETTE)) expect(used.has(ch), `palette colour "${ch}" is used`).toBe(true);
  });

  // Centre of the blade pixels in each row, for fitting a line through them.
  const bladeCentres = () => {
    const points = [];
    KATANA.forEach((row, y) => {
      const xs = [...row].map((ch, x) => ('med' + 'H').includes(ch) ? x : -1).filter((x) => x >= 0);
      if (xs.length) points.push([y, (Math.min(...xs) + Math.max(...xs)) / 2]);
    });
    return points;
  };
  const fit = (points) => {
    const n = points.length;
    const mx = points.reduce((t, p) => t + p[0], 0) / n;
    const my = points.reduce((t, p) => t + p[1], 0) / n;
    const sxy = points.reduce((t, p) => t + (p[0] - mx) * (p[1] - my), 0);
    const sxx = points.reduce((t, p) => t + (p[0] - mx) ** 2, 0);
    const syy = points.reduce((t, p) => t + (p[1] - my) ** 2, 0);
    return { slope: sxy / sxx, r2: (sxy * sxy) / (sxx * syy) };
  };

  it('is straight: the blade follows a single line from the guard to the tip', () => {
    const { r2 } = fit(bladeCentres().slice(10, -6));
    expect(r2).toBeGreaterThan(0.995);
  });

  it('is planted at about 60 degrees from the ground, leaning to the right', () => {
    const { slope } = fit(bladeCentres().slice(10, -6));
    // x falls by `slope` for every row down, so the hilt is to the right of the tip.
    expect(slope).toBeLessThan(0);
    const angle = (Math.atan(1 / Math.abs(slope)) * 180) / Math.PI;
    expect(angle).toBeGreaterThan(57);
    expect(angle).toBeLessThan(63);
    const rows = KATANA.map((row) => [...row].findIndex((ch) => ch !== '.' && ch !== 'o')).filter((x) => x >= 0);
    expect(rows[0], 'the pommel is on the right').toBeGreaterThan(rows[rows.length - 1] + 20);
  });

  it('is drawn finely: the blade is long and slim, and much longer than the grip', () => {
    const bladeRows = KATANA.filter((row) => /[med]/.test(row)).length;
    const gripRows = KATANA.filter((row) => /[hu]/.test(row)).length;
    expect(bladeRows).toBeGreaterThan(gripRows * 2);
    expect(KATANA_W).toBeGreaterThanOrEqual(60);
    expect(KATANA_H).toBeGreaterThanOrEqual(110);
  });

  it('has a wrap, metal fittings, a lit edge, a shaded spine and a temper line', () => {
    const all = KATANA.join('');
    for (const ch of ['r', 'g', 'e', 'd', 'H', 'h', 'P', 'G']) expect(all).toContain(ch);
  });

  it('is tall and slim, and not oversized', () => {
    expect(KATANA_H).toBeGreaterThan(KATANA_W * 1.4);
    expect(KATANA_H).toBeLessThanOrEqual(150);
    expect(KATANA_W).toBeLessThanOrEqual(95);
  });

  it('is drawn at one pixel per unit on a normal screen, so it is not chunky', () => {
    expect(css).toMatch(/--px:\s*1px;/);
  });
});
