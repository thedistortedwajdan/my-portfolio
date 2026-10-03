// Pixel art for the desktop scene: a straight katana planted in the ground at a 60 degree angle, leaning
// to the right. One character is one pixel; "." is empty. It is drawn along a straight centre line, so the
// grip, the guard and the blade all share one axis, then outlined automatically and cropped to its edges.
//
// Palette (each letter maps to a colour token in styles.css, so light and dark follow the theme):
//   o ink   m steel  e steel edge  d steel shade  H temper line
//   g fitting  G fitting light  t fitting dark   r wrap  R wrap dark  P wrap light   h grip  u grip light

export const PALETTE = {
  o: 'ink',
  m: 'steel',
  e: 'steel-edge',
  d: 'steel-shade',
  H: 'hamon',
  g: 'fitting',
  G: 'fitting-lt',
  t: 'fitting-dk',
  r: 'wrap',
  R: 'wrap-dk',
  P: 'wrap-lt',
  h: 'grip',
  u: 'grip-lt',
};

// The sword, measured along its axis from the pommel (s = 0) to the tip.
const LENGTH = 150;
const ANGLE = 60; // degrees from the ground
const PART = {
  pommelEnd: 8,
  gripEnd: 36,
  fuchiEnd: 39,
  guardAt: 43,
  habakiFrom: 46.5,
  bladeFrom: 52,
  tip: 18,
};

const RAD = (ANGLE * Math.PI) / 180;
// Unit vector from the pommel to the tip: down and to the left, so the hilt leans right.
const DIR = [-Math.cos(RAD), Math.sin(RAD)];
// Right-hand normal of that direction.
const NORMAL = [DIR[1], -DIR[0]];

const PAD = 20;
const CANVAS_W = Math.ceil(LENGTH * Math.cos(RAD)) + 2 * PAD + 14;
const CANVAS_H = Math.ceil(LENGTH * Math.sin(RAD)) + 2 * PAD;
const ORIGIN = [PAD + 14 + LENGTH * Math.cos(RAD), PAD];

function makeKatana() {
  const grid = Array.from({ length: CANVAS_H }, () => Array.from({ length: CANVAS_W }, () => '.'));

  for (let py = 0; py < CANVAS_H; py += 1) {
    for (let px = 0; px < CANVAS_W; px += 1) {
      const dx = px + 0.5 - ORIGIN[0];
      const dy = py + 0.5 - ORIGIN[1];
      // Along the sword (s) and across it (u).
      const s = dx * DIR[0] + dy * DIR[1];
      const u = dx * NORMAL[0] + dy * NORMAL[1];
      const au = Math.abs(u);
      let ch = '.';

      // The guard is a flat oval plate across the sword.
      const gs = s - PART.guardAt;
      const ge = (u / 11) ** 2 + (gs / 3.8) ** 2;

      if (ge <= 1) {
        const nick = Math.min(Math.hypot(au - 6.2, gs));
        if (ge > 0.6) ch = u < 0 ? 'G' : gs > 0 ? 't' : 'g';
        else if (nick < 1.3) ch = 'o';
        else ch = u < -3 ? 'P' : u > 3.2 ? 'R' : 'r';
      } else if (s >= 1 && s < PART.pommelEnd && au <= 5 * Math.sqrt(Math.max(0, 1 - (Math.max(0, 4.2 - s) / 3.2) ** 2))) {
        // Pommel cap.
        ch = u < -2 ? 'P' : u > 2.2 ? 'R' : 'r';
      } else if (s >= PART.pommelEnd && s < PART.gripEnd && au <= 4.4) {
        // Grip: dark, with a blue-grey diamond wrap and a metal ornament.
        const period = 9;
        const phase = ((s - PART.pommelEnd) % period) / period;
        const reach = 3.2 * Math.abs(2 * phase - 1);
        if (Math.abs(au - reach) < 0.8) ch = au < 0.9 ? 'R' : 'r';
        else ch = u < -2 ? 'u' : 'h';
        if (s > 20 && s < 23.5 && au < 1.5) ch = s < 21.8 ? 'G' : 'g';
      } else if (s >= PART.gripEnd && s < PART.fuchiEnd && au <= 5) {
        ch = u < -1.8 ? 'G' : u > 2 ? 't' : 'g';
      } else if (s >= PART.habakiFrom && s < PART.bladeFrom && au <= 4.2) {
        ch = u < -1.4 ? 'G' : u > 1.8 ? 't' : 'g';
      } else if (s >= PART.bladeFrom && s <= LENGTH) {
        const toTip = LENGTH - s;
        const half = toTip < PART.tip ? 3.3 * Math.sqrt(Math.max(0, toTip / PART.tip)) + 0.4 : 3.3;
        if (au <= half) {
          const v = u / half;
          // Lit from the upper left: a bright edge on that side, the spine in shade on the other.
          if (v < -0.6) ch = 'e';
          else if (v > 0.56) ch = 'd';
          else if (Math.abs(v - (0.14 + 0.16 * Math.sin(s / 9))) < 0.2) ch = 'H';
          else ch = s % 30 < 4 ? 'e' : 'm';
        }
      }
      grid[py][px] = ch;
    }
  }

  // Outline: every empty pixel that touches the drawing becomes ink.
  const marks = [];
  for (let y = 0; y < CANVAS_H; y += 1) {
    for (let x = 0; x < CANVAS_W; x += 1) {
      if (grid[y][x] !== '.') continue;
      const touches = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const near = grid[y + dy]?.[x + dx];
        return near && near !== '.';
      });
      if (touches) marks.push([x, y]);
    }
  }
  for (const [x, y] of marks) grid[y][x] = 'o';

  // Crop to the drawing, so the tip sits exactly on the bottom edge.
  const rows = grid.map((row) => row.join(''));
  const used = rows.map((row, y) => (/[^.]/.test(row) ? y : -1)).filter((y) => y >= 0);
  const top = used[0];
  const bottom = used[used.length - 1];
  const cols = [...Array(CANVAS_W).keys()].filter((x) => rows.some((row) => row[x] !== '.'));
  const left = cols[0];
  const right = cols[cols.length - 1];
  return rows.slice(top, bottom + 1).map((row) => row.slice(left, right + 1));
}

export const KATANA = makeKatana();
export const KATANA_W = KATANA[0].length;
export const KATANA_H = KATANA.length;
