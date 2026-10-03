import { KATANA, KATANA_H, KATANA_W, PALETTE } from './sprites.js';

// Decorative pixel-art scene behind the page on desktop: fine, sharp grass that sways along the bottom edge
// and a straight katana planted in the right-hand corner.
// Everything is drawn with SVG shapes and animated with CSS classes only (the CSP forbids inline styles).

// The grass is drawn at one pixel per unit, like the katana, so every blade is thin and sharp.
export const TILE_W = 480;
export const TILE_H = 96;
export const WAVE_WIDTH = 20; // blades this far apart sway one step apart; 8 steps make 160, which divides the tile
const WAVES = 8;
export const FIREFLIES = 9; // drift around the katana, in dark mode only
const TILES = [0, 1, 0, 1, 0, 1]; // two seeded variants, repeated across the width

// Size in sprite units. styles.css keeps matching numbers in --sword-w and --sword-h.
export const SIZES = { swordW: KATANA_W, swordH: KATANA_H };

// Small seeded random numbers, so every visit draws the same meadow.
function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n) => Math.round(n * 10) / 10;

// A blade is a slim curved spike: wide at the root, a sharp point at the top. Every blade overlaps its
// neighbours at the root, so no bare ground shows between them. The back row is taller and darker, the front
// row is denser and lower.
function makeBlades(seed, back) {
  const random = rng(seed);
  const pitch = back ? 4 : 3;
  const blades = [];
  for (let step = -1; step * pitch < TILE_W + pitch; step += 1) {
    const x = step * pitch + (random() - 0.5) * 1.4;
    const tall = random() < (back ? 0.25 : 0.18);
    const height = back ? (tall ? 62 : 40) + random() * 14 : (tall ? 40 : 24) + random() * 14;
    const width = (back ? 6 : 4.6) + random() * 1.2;
    const lean = (random() - 0.35) * 7;
    const ground = TILE_H;
    const tipX = x + width / 2 + lean;
    const tipY = ground - height;
    const wave = ((Math.floor(x / WAVE_WIDTH) % WAVES) + WAVES) % WAVES;
    blades.push({
      key: step,
      wave,
      tone: Math.floor(random() * 3),
      d:
        `M${round(x)} ${ground}` +
        `Q${round(x + lean * 0.25)} ${round(ground - height * 0.55)} ${round(tipX)} ${round(tipY)}` +
        `Q${round(x + width + lean * 0.25)} ${round(ground - height * 0.5)} ${round(x + width)} ${ground}Z`,
    });
  }
  return blades;
}

function groupByWave(blades) {
  const waves = Array.from({ length: WAVES }, () => []);
  for (const blade of blades) waves[blade.wave].push(blade);
  return waves;
}

const VARIANTS = [
  { back: groupByWave(makeBlades(101, true)), front: groupByWave(makeBlades(7, false)) },
  { back: groupByWave(makeBlades(211, true)), front: groupByWave(makeBlades(23, false)) },
];

// Blades in the same wave bend together, so a few groups carry all the animation.
function Layer({ name, waves }) {
  return (
    <g className={`layer ${name}`}>
      {waves.map((blades, i) => (
        <g key={i} className={`wave w${i}`}>
          {blades.map((blade) => (
            <path key={blade.key} className={`c${blade.tone}`} d={blade.d} />
          ))}
        </g>
      ))}
    </g>
  );
}

function Tile({ variant }) {
  const { back, front } = VARIANTS[variant];
  return (
    <svg className="tile" viewBox={`0 0 ${TILE_W} ${TILE_H}`} focusable="false">
      <rect className="under" x="0" y={TILE_H - 28} width={TILE_W} height="28" />
      <rect className="soil" x="0" y={TILE_H - 5} width={TILE_W} height="5" />
      <Layer name="back" waves={back} />
      <Layer name="front" waves={front} />
    </svg>
  );
}

// Turns sprite rows into rects, joining runs of the same colour so there are far fewer elements.
function runs(rows, offsetX = 0, offsetY = 0) {
  const out = [];
  rows.forEach((row, y) => {
    let start = 0;
    for (let x = 1; x <= row.length; x += 1) {
      if (x < row.length && row[x] === row[start]) continue;
      const name = PALETTE[row[start]];
      if (name) out.push({ key: `${offsetX + start}-${offsetY + y}`, x: offsetX + start, y: offsetY + y, width: x - start, name });
      start = x;
    }
  });
  return out;
}

function Pixels({ rects }) {
  return rects.map((rect) => (
    <rect key={rect.key} className={`p-${rect.name}`} x={rect.x} y={rect.y} width={rect.width} height="1" />
  ));
}

const SWORD_RECTS = runs(KATANA);

function Sword() {
  return (
    <svg className="sword px" viewBox={`0 0 ${SIZES.swordW} ${SIZES.swordH}`} focusable="false">
      <Pixels rects={SWORD_RECTS} />
    </svg>
  );
}

export default function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="vignette">
        <Sword />
        {Array.from({ length: FIREFLIES }, (_, i) => (
          <i key={i} className={`firefly f${i}`} />
        ))}
      </div>
      <div className="meadow">
        {TILES.map((variant, index) => (
          <Tile key={index} variant={variant} />
        ))}
      </div>
    </div>
  );
}
