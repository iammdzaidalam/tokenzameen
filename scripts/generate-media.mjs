/**
 * Generates the abstract architectural artwork that stands in for project
 * photography. Output paths are fixed because `src/content/projects.ts` and
 * `src/content/categories.ts` already point at them — see docs/MEDIA.md.
 *
 * Zero dependencies, seeded PRNG, byte-identical on every run.
 */

import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = join(ROOT, "public", "media");
const MAX_BYTES = 40 * 1024;
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ *
 * Deterministic randomness
 * ------------------------------------------------------------------ */

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function makeRng(seed) {
  let s = fnv1a(String(seed));
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (a, b) => a + (b - a) * next(),
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (p) => next() < p,
  };
}

/* ------------------------------------------------------------------ *
 * Serialisation helpers
 * ------------------------------------------------------------------ */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a, b, t) => a + (b - a) * t;

/** Throws rather than letting a NaN reach a coordinate attribute. */
function n(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`non-finite coordinate: ${String(value)}`);
  }
  const r = Math.round(value * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

function o(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`non-finite opacity: ${String(value)}`);
  }
  return String(Math.round(clamp01(value) * 1000) / 1000);
}

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attrs(map) {
  let out = "";
  for (const [key, value] of Object.entries(map)) {
    if (value === undefined || value === null) continue;
    out += ` ${key}="${typeof value === "number" ? n(value) : esc(value)}"`;
  }
  return out;
}

const el = (tag, map, children) =>
  children === undefined
    ? `<${tag}${attrs(map)}/>`
    : `<${tag}${attrs(map)}>${children}</${tag}>`;

const pts = (list) => list.map(([x, y]) => `${n(x)},${n(y)}`).join(" ");

const rect = (x, y, w, h, m = {}) => el("rect", { x, y, width: w, height: h, ...m });
const poly = (points, m = {}) => el("polygon", { points: pts(points), ...m });
const pline = (points, m = {}) => el("polyline", { points: pts(points), fill: "none", ...m });
const line = (x1, y1, x2, y2, m = {}) => el("line", { x1, y1, x2, y2, ...m });
const circle = (cx, cy, r, m = {}) => el("circle", { cx, cy, r, ...m });
const ellipse = (cx, cy, rx, ry, m = {}) => el("ellipse", { cx, cy, rx, ry, ...m });
const path = (d, m = {}) => el("path", { d, ...m });
const group = (m, children) => el("g", m, children);

/* ------------------------------------------------------------------ *
 * Palette — mirrors the tokens in src/app/globals.css
 * ------------------------------------------------------------------ */

const C = {
  carbon950: "#060607",
  carbon900: "#0a0a0c",
  carbon850: "#0e0f12",
  carbon800: "#131418",
  carbon700: "#191b20",
  carbon600: "#212429",
  carbon500: "#2b2f36",
  carbon400: "#3a3f47",
  steel500: "#5a616b",
  steel400: "#767d88",
  steel300: "#939aa4",
  steel200: "#b4bac2",
  bone100: "#f5f3ee",
  bone300: "#d9d5ca",
  gold200: "#e5d3a8",
  gold400: "#c9a961",
  sage400: "#7d9d7b",
  sage500: "#5c7d5b",
  sage300: "#a8bfa6",
  lotus300: "#cdbfd8",
  lotus400: "#a993ba",
};

/** Depth ramp: index 0 sits furthest back, each plane forward is a shade lighter. */
const PLANE = [C.carbon900, C.carbon800, C.carbon700, C.carbon600];

/**
 * The key light stays warm across the whole system; a category only leans its
 * palette through the horizon haze and the hairlines.
 */
const ACCENTS = {
  gold: { glow: C.gold400, haze: C.gold400, rim: C.gold200, lit: C.gold200, hair: C.gold400 },
  steel: { glow: C.steel400, haze: C.steel500, rim: C.bone300, lit: C.bone300, hair: C.steel300 },
  sage: { glow: C.gold400, haze: C.sage400, rim: C.gold200, lit: C.gold200, hair: C.sage400 },
  lotus: { glow: C.lotus400, haze: C.lotus400, rim: C.gold200, lit: C.gold200, hair: C.lotus400 },
};

const MOODS = {
  dusk: {
    skyTop: C.carbon950, skyMid: "#0b0b0e", skyLow: "#191410", skyFloor: C.carbon900,
    glowOp: 0.38, hazeOp: 0.22, litOp: 0.55, tintOp: 0.05, sunUp: 60, sunX: 1720,
  },
  gold: {
    skyTop: "#08070a", skyMid: "#100e10", skyLow: "#241a11", skyFloor: "#0b0a0a",
    glowOp: 0.46, hazeOp: 0.3, litOp: 0.4, tintOp: 0.07, sunUp: 210, sunX: 600,
  },
  blue: {
    skyTop: C.carbon950, skyMid: "#0a0c11", skyLow: "#151b23", skyFloor: "#090a0d",
    glowOp: 0.26, hazeOp: 0.18, litOp: 0.68, tintOp: 0.035, sunUp: 14, sunX: 1960,
  },
  night: {
    skyTop: C.carbon950, skyMid: "#08080a", skyLow: "#101114", skyFloor: C.carbon950,
    glowOp: 0.17, hazeOp: 0.11, litOp: 0.85, tintOp: 0.025, sunUp: -70, sunX: 520,
  },
  dawn: {
    skyTop: "#080a0c", skyMid: "#111519", skyLow: "#1e2321", skyFloor: "#0b0d0e",
    glowOp: 0.32, hazeOp: 0.32, litOp: 0.3, tintOp: 0.06, sunUp: 130, sunX: 1540,
  },
};

/* ------------------------------------------------------------------ *
 * World frame and one-point perspective
 *
 * A scene is drawn once in world units and then cropped by a camera, so the
 * five images of a project are the same place seen from different positions.
 * ------------------------------------------------------------------ */

const HORIZON = 820;
const GROUND_BOTTOM = 2900;
const EXT_L = -1800;
const EXT_R = 4400;
const FOCAL = 1000;
const CAM_H = 260;
const CENTER_X = 1200;

/** Projects a point on the ground plane: X is lateral offset, z is depth. */
function ground(X, z) {
  const d = Math.max(z, 40);
  return [CENTER_X + (FOCAL * X) / d, HORIZON + (FOCAL * CAM_H) / d];
}

/** Screen height of a world height H standing at depth z. */
const rise = (H, z) => (FOCAL * H) / Math.max(z, 40);

function toScreen(cam, x, y) {
  return [cam.s * (x - cam.cx) + cam.w / 2, cam.s * (y - cam.cy) + cam.h / 2];
}

/* ------------------------------------------------------------------ *
 * Document
 * ------------------------------------------------------------------ */

function createDoc({ key, width, height, title, desc }) {
  return {
    key,
    width,
    height,
    title,
    desc,
    defs: [],
    parts: [],
    id: (name) => `${key}-${name}`,
  };
}

function renderDoc(doc) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${doc.width}" height="${doc.height}" ` +
    `viewBox="0 0 ${doc.width} ${doc.height}" preserveAspectRatio="xMidYMid slice" ` +
    `role="img" aria-labelledby="${doc.id("title")}">` +
    `<title id="${doc.id("title")}">${esc(doc.title)}</title>` +
    `<desc>${esc(doc.desc)}</desc>` +
    `<defs>${doc.defs.join("")}</defs>` +
    doc.parts.join("") +
    `</svg>\n`
  );
}

function linearGrad(doc, name, { x1, y1, x2, y2, stops }) {
  const id = doc.id(name);
  const body = stops
    .map(([offset, color, opacity]) =>
      `<stop offset="${o(offset)}" stop-color="${color}"${opacity === undefined ? "" : ` stop-opacity="${o(opacity)}"`}/>`,
    )
    .join("");
  doc.defs.push(
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}">${body}</linearGradient>`,
  );
  return `url(#${id})`;
}

function radialGrad(doc, name, { cx, cy, r, stops }) {
  const id = doc.id(name);
  const body = stops
    .map(([offset, color, opacity]) =>
      `<stop offset="${o(offset)}" stop-color="${color}" stop-opacity="${o(opacity)}"/>`,
    )
    .join("");
  doc.defs.push(
    `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}">${body}</radialGradient>`,
  );
  return `url(#${id})`;
}

/** Pattern origin is pinned to the facade so lit windows land on the same grid. */
function windowPattern(doc, name, { ox, oy, cw, ch, ww, wh, fill, opacity }) {
  const id = doc.id(name);
  doc.defs.push(
    `<pattern id="${id}" x="${n(ox)}" y="${n(oy)}" width="${n(cw)}" height="${n(ch)}" patternUnits="userSpaceOnUse">` +
      rect((cw - ww) / 2, (ch - wh) / 2, ww, wh, { fill, "fill-opacity": o(opacity) }) +
      `</pattern>`,
  );
  return `url(#${id})`;
}

/* ------------------------------------------------------------------ *
 * Shared treatment: light, haze, grid, vignette, grain
 * ------------------------------------------------------------------ */

function addSky(doc, cam, mood, accent) {
  const hz = toScreen(cam, 0, HORIZON)[1];
  const f = clamp(hz / doc.height, 0.08, 0.98);
  const a = clamp(f - 0.46, 0.02, 0.9);
  const sky = linearGrad(doc, "sky", {
    x1: 0, y1: 0, x2: 0, y2: doc.height,
    stops: [
      [0, mood.skyTop],
      [a, mood.skyMid],
      [Math.min(f, 0.985), mood.skyLow],
      [1, mood.skyFloor],
    ],
  });
  doc.parts.push(rect(0, 0, doc.width, doc.height, { fill: sky }));

  const [sx, sy] = toScreen(cam, mood.sunX, HORIZON - mood.sunUp);
  const glow = radialGrad(doc, "glow", {
    cx: sx, cy: sy, r: Math.max(doc.width, doc.height) * 0.92,
    stops: [
      [0, accent.glow, mood.glowOp],
      [0.3, accent.glow, mood.glowOp * 0.42],
      [0.66, accent.glow, mood.glowOp * 0.12],
      [1, accent.glow, 0],
    ],
  });
  doc.parts.push(rect(0, 0, doc.width, doc.height, { fill: glow }));

  const haze = linearGrad(doc, "haze", {
    x1: 0, y1: hz - doc.height * 0.3, x2: 0, y2: hz + doc.height * 0.16,
    stops: [
      [0, accent.haze, 0],
      [0.62, accent.haze, mood.hazeOp],
      [0.82, accent.haze, mood.hazeOp * 0.5],
      [1, accent.haze, 0],
    ],
  });
  doc.parts.push(rect(0, 0, doc.width, doc.height, { fill: haze }));
}

function addOverlays(doc, mood, accent) {
  doc.parts.push(
    rect(0, 0, doc.width, doc.height, { fill: accent.haze, "fill-opacity": o(mood.tintOp) }),
  );

  const gridId = doc.id("grid");
  doc.defs.push(
    `<pattern id="${gridId}" width="18" height="18" patternUnits="userSpaceOnUse">` +
      rect(0, 0, 1, 18, { fill: C.bone100, "fill-opacity": "0.5" }) +
      `</pattern>`,
  );
  doc.parts.push(rect(0, 0, doc.width, doc.height, { fill: `url(#${gridId})`, opacity: "0.05" }));

  const vigId = doc.id("vignette");
  doc.defs.push(
    `<radialGradient id="${vigId}" cx="0.5" cy="0.46" r="0.78">` +
      `<stop offset="0.3" stop-color="#000000" stop-opacity="0"/>` +
      `<stop offset="0.68" stop-color="#000000" stop-opacity="0.26"/>` +
      `<stop offset="1" stop-color="${C.carbon950}" stop-opacity="0.82"/>` +
      `</radialGradient>`,
  );
  doc.parts.push(rect(0, 0, doc.width, doc.height, { fill: `url(#${vigId})` }));

  const grainId = doc.id("grain");
  doc.defs.push(
    `<filter id="${grainId}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" seed="11" stitchTiles="stitch" result="noise"/>` +
      `<feColorMatrix in="noise" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.9 0 0 0 -0.36"/>` +
      `</filter>`,
  );
  doc.parts.push(
    rect(0, 0, doc.width, doc.height, {
      fill: C.carbon950,
      filter: `url(#${grainId})`,
      opacity: "0.13",
    }),
  );
}

/* ------------------------------------------------------------------ *
 * Reusable scene pieces
 * ------------------------------------------------------------------ */

function ridgeShape(R, { y, amp, step = 220, jag = 0.6 }) {
  const ph = [R.range(0, TAU), R.range(0, TAU), R.range(0, TAU)];
  const points = [];
  for (let x = EXT_L; x <= EXT_R + step; x += step) {
    const u =
      0.5 +
      0.3 * Math.sin(x * 0.00113 + ph[0]) +
      0.14 * Math.sin(x * 0.0031 + ph[1]) +
      0.09 * jag * Math.sin(x * 0.0074 + ph[2]);
    points.push([x, y - amp * clamp01(u)]);
  }
  points.push([EXT_R + step, GROUND_BOTTOM], [EXT_L, GROUND_BOTTOM]);
  return points;
}

function treeLinePath(R, { y, h, depth = 460 }) {
  let d = `M ${n(EXT_L)} ${n(y)}`;
  let x = EXT_L;
  while (x < EXT_R) {
    const w = R.range(h * 0.9, h * 2.1);
    const bump = R.range(h * 0.5, h * 1.3);
    d += ` q ${n(w / 2)} ${n(-bump)} ${n(w)} 0`;
    x += w;
  }
  d += ` L ${n(x)} ${n(y + depth)} L ${n(EXT_L)} ${n(y + depth)} Z`;
  return d;
}

function canopy(R, { cx, cy, r, fill, opacity, blobs = 5 }) {
  const out = [];
  for (let i = 0; i < blobs; i += 1) {
    const a = (i / blobs) * TAU + R.range(-0.4, 0.4);
    const d = r * R.range(0.18, 0.52);
    out.push(
      circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.62, r * R.range(0.52, 0.86), {
        fill,
        "fill-opacity": o(opacity),
      }),
    );
  }
  return out.join("");
}

function palm(R, { x, y, h, lean, stroke, width, opacity }) {
  const tipX = x + lean * h;
  const tipY = y - h;
  const out = [
    path(`M ${n(x)} ${n(y)} Q ${n(x + lean * h * 0.2)} ${n(y - h * 0.62)} ${n(tipX)} ${n(tipY)}`, {
      stroke,
      "stroke-width": n(width),
      fill: "none",
      "stroke-linecap": "round",
      "stroke-opacity": o(opacity),
    }),
  ];
  const fronds = 7;
  for (let i = 0; i < fronds; i += 1) {
    const a = -Math.PI * 0.94 + (i / (fronds - 1)) * Math.PI * 0.88 + R.range(-0.06, 0.06);
    const len = h * R.range(0.3, 0.46);
    const ex = tipX + Math.cos(a) * len;
    const ey = tipY + Math.sin(a) * len * 0.64 + len * 0.3;
    const mx = tipX + Math.cos(a) * len * 0.52;
    const my = tipY + Math.sin(a) * len * 0.52 - len * 0.16;
    out.push(
      path(`M ${n(tipX)} ${n(tipY)} Q ${n(mx)} ${n(my)} ${n(ex)} ${n(ey)}`, {
        stroke,
        "stroke-width": n(width * 0.62),
        fill: "none",
        "stroke-linecap": "round",
        "stroke-opacity": o(opacity * 0.9),
      }),
    );
  }
  return out.join("");
}

function ripples(R, { y0, y1, x0, x1, color, opacity, count = 16 }) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const y = lerp(y0, y1, t * t);
    const w = (x1 - x0) * R.range(0.12, 0.46);
    const x = lerp(x0, x1 - w, R.next());
    out.push(
      rect(x, y, w, lerp(1.2, 3.4, t), {
        fill: color,
        "fill-opacity": o(opacity * lerp(0.35, 1, t)),
      }),
    );
  }
  return out.join("");
}

/** Mirrors content about a waterline; k squashes the reflection. */
function reflect(content, { y0, k = 0.58, opacity = 0.2, clipId }) {
  return group(
    {
      transform: `translate(0 ${n(y0 * (1 + k))}) scale(1 ${n(-k)})`,
      opacity: o(opacity),
      "clip-path": clipId ? `url(#${clipId})` : undefined,
    },
    content,
  );
}

function rimEdge(doc, name, { x, y, w, h, color, opacity = 0.55 }) {
  const fill = linearGrad(doc, name, {
    x1: x, y1: 0, x2: x + w, y2: 0,
    stops: [
      [0, color, 0],
      [0.55, color, opacity * 0.4],
      [1, color, opacity],
    ],
  });
  return rect(x, y, w, h, { fill });
}

function litWindows(R, { x, y, w, h, cw, ch, ww, wh, ratio, color, baseOp, max = 90 }) {
  const cols = Math.max(1, Math.floor(w / cw));
  const rows = Math.max(1, Math.floor(h / ch));
  const out = [];
  let budget = max;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const hit = R.chance(ratio);
      const jitter = R.range(0.45, 1);
      if (!hit || budget <= 0) continue;
      out.push(
        rect(x + c * cw + (cw - ww) / 2, y + r * ch + (ch - wh) / 2, ww, wh, {
          fill: color,
          "fill-opacity": o(baseOp * jitter),
        }),
      );
      budget -= 1;
    }
  }
  return out.join("");
}

function groundPlane(doc, { near, far, top = HORIZON }) {
  const fill = linearGrad(doc, "ground", {
    x1: 0, y1: top, x2: 0, y2: GROUND_BOTTOM,
    stops: [[0, far], [0.42, near], [1, near]],
  });
  return rect(EXT_L, top, EXT_R - EXT_L, GROUND_BOTTOM - top, { fill });
}

/** A background block with its own aligned window grid. */
function backBlock(doc, R, { name, x, w, top, base, cw, ch, ww, wh, ratio, lit, litOp, max }) {
  const out = [rect(x, top, w, base - top, { fill: PLANE[0] })];
  const fx = x + 12;
  const fy = top + 18;
  const fw = w - 24;
  const fh = base - top - 28;
  if (fw > cw && fh > ch) {
    const pat = windowPattern(doc, name, { ox: fx, oy: fy, cw, ch, ww, wh, fill: C.carbon600, opacity: 0.85 });
    out.push(rect(fx, fy, fw, fh, { fill: pat, opacity: "0.55" }));
    out.push(litWindows(R, { x: fx, y: fy, w: fw, h: fh, cw, ch, ww, wh, ratio, color: lit, baseOp: litOp, max }));
  }
  out.push(rect(x, top, w, 4, { fill: C.carbon700 }));
  return out.join("");
}

/* ------------------------------------------------------------------ *
 * Scene: stacked slabs and a tower mass (apartments, Haridwar One)
 * ------------------------------------------------------------------ */

function sceneTower(doc, R, opt) {
  const A = ACCENTS[opt.accent];
  const M = opt.mood;
  const L = [];
  const river = opt.river === true;

  L.push(poly(ridgeShape(R, { y: HORIZON + 6, amp: 300, step: 240, jag: 1 }), { fill: C.carbon850 }));
  L.push(poly(ridgeShape(R, { y: HORIZON + 20, amp: 168, step: 210, jag: 0.6 }), { fill: "#0c0d11" }));
  L.push(groundPlane(doc, { near: PLANE[1], far: C.carbon850 }));

  if (river) {
    const waterFill = linearGrad(doc, "river", {
      x1: 0, y1: HORIZON + 14, x2: 0, y2: HORIZON + 130,
      stops: [[0, A.haze, 0.3], [0.5, C.carbon800, 0.85], [1, C.carbon850, 1]],
    });
    L.push(rect(EXT_L, HORIZON + 14, EXT_R - EXT_L, 116, { fill: waterFill }));
    L.push(ripples(R, { y0: HORIZON + 22, y1: HORIZON + 124, x0: 0, x1: 2400, color: A.rim, opacity: 0.22, count: 14 }));
  }

  const flank = [
    { name: "fb0", x: 236, w: 360, top: 318 },
    { name: "fb1", x: 1744, w: 320, top: 250 },
    { name: "fb2", x: 2152, w: 250, top: 452 },
    { name: "fb3", x: -80, w: 268, top: 470 },
  ];
  for (const b of flank) {
    L.push(
      backBlock(doc, R, {
        name: b.name, x: b.x, w: b.w, top: b.top, base: HORIZON + 210,
        cw: 26, ch: 34, ww: 12, wh: 17, ratio: 0.16, lit: A.lit, litOp: M.litOp * 0.6, max: 20,
      }),
    );
  }

  const tx0 = 876;
  const tx1 = 1524;
  const top = 34;
  const base = HORIZON + 214;
  const deckY = 392;
  const pitch = 40;

  const towerFill = linearGrad(doc, "towerface", {
    x1: tx0, y1: 0, x2: tx1, y2: 0,
    stops: [[0, C.carbon850], [0.46, PLANE[2]], [1, C.carbon600]],
  });
  L.push(rect(tx0, top, tx1 - tx0, base - top, { fill: towerFill }));

  const fx = tx0 + 96;
  const fw = tx1 - tx0 - 108;
  const faceWin = windowPattern(doc, "winface", {
    ox: fx, oy: top, cw: 32, ch: pitch, ww: 19, wh: 20, fill: C.carbon950, opacity: 0.88,
  });
  L.push(rect(fx, top, fw, base - top - 40, { fill: faceWin }));
  L.push(
    litWindows(R, {
      x: fx, y: top, w: fw, h: base - top - 60,
      cw: 32, ch: pitch, ww: 19, wh: 20, ratio: 0.2, color: A.lit, baseOp: M.litOp, max: 58,
    }),
  );

  const floors = Math.floor((base - 60 - top) / pitch);
  for (let i = 0; i < floors; i += 1) {
    const y = top + i * pitch;
    L.push(rect(tx0 - 14, y + 30, tx1 - tx0 + 28, 10, { fill: C.carbon500 }));
    L.push(rect(tx0 - 14, y + 30, tx1 - tx0 + 28, 2.6, { fill: C.steel500, "fill-opacity": "0.45" }));
    L.push(rect(tx0 - 14, y + 40, tx1 - tx0 + 28, 3, { fill: C.carbon950, "fill-opacity": "0.55" }));
    if (i % 3 === 1) {
      L.push(
        rect(tx1 - 228, y + 8, 234, 22, {
          fill: PLANE[3],
          stroke: C.carbon400,
          "stroke-width": "1.2",
          "stroke-opacity": "0.6",
        }),
      );
    }
  }
  for (const mx of [tx0 + 214, tx0 + 386]) {
    L.push(rect(mx, top, 7, base - top, { fill: C.carbon850, "fill-opacity": "0.85" }));
  }
  L.push(rect(tx0, top, 92, base - top, { fill: C.carbon800 }));
  L.push(rect(tx0 + 88, top, 3, base - top, { fill: C.carbon500, "fill-opacity": "0.45" }));

  L.push(rect(tx0 - 12, deckY, tx1 - tx0 + 24, 15, { fill: C.carbon500 }));
  for (let i = 0; i < 24; i += 1) {
    L.push(rect(tx0 + 4 + i * 28, deckY - 22, 2.2, 22, { fill: C.steel500, "fill-opacity": "0.5" }));
  }
  L.push(rect(tx0 - 12, deckY - 24, tx1 - tx0 + 24, 2.6, { fill: A.rim, "fill-opacity": o(0.34 + M.litOp * 0.2) }));

  L.push(rimEdge(doc, "towerrim", { x: tx1 - 26, y: top, w: 30, h: base - top, color: A.rim, opacity: 0.6 }));
  L.push(rect(tx1 + 2, top, 2.6, base - top, { fill: A.rim, "fill-opacity": "0.5" }));
  L.push(rect(tx0, top, tx1 - tx0, 3, { fill: A.rim, "fill-opacity": "0.28" }));

  const podTop = base;
  L.push(rect(tx0 - 300, podTop, tx1 - tx0 + 600, 132, { fill: PLANE[3] }));
  L.push(rect(tx0 - 300, podTop, tx1 - tx0 + 600, 3, { fill: C.carbon400, "fill-opacity": "0.55" }));
  const portal = linearGrad(doc, "portal", {
    x1: 0, y1: podTop + 18, x2: 0, y2: podTop + 132,
    stops: [[0, A.lit, 0.5], [1, A.lit, 0.06]],
  });
  L.push(rect(1104, podTop + 18, 210, 114, { fill: portal }));
  L.push(rect(1090, podTop + 6, 238, 8, { fill: C.carbon500 }));
  for (let i = 0; i < 8; i += 1) {
    L.push(rect(tx0 - 268 + i * 106, podTop + 46, 62, 86, { fill: A.lit, "fill-opacity": o(0.05 + 0.06 * M.litOp) }));
  }

  L.push(path(treeLinePath(R, { y: HORIZON + 402, h: 74 }), { fill: C.carbon850 }));
  L.push(rect(EXT_L, HORIZON + 470, EXT_R - EXT_L, GROUND_BOTTOM - HORIZON - 470, { fill: PLANE[3], "fill-opacity": "0.9" }));
  L.push(rect(EXT_L, HORIZON + 470, EXT_R - EXT_L, 3, { fill: C.carbon400, "fill-opacity": "0.4" }));
  for (let i = 0; i < 30; i += 1) {
    const x = -300 + i * 96 + R.range(-22, 22);
    L.push(rect(x, HORIZON + 470 - R.range(26, 70), 3, 70, { fill: C.carbon950, "fill-opacity": "0.7" }));
  }

  return {
    layers: L,
    focus: {
      wide: { cx: 1200, cy: 560, s: 0.92 },
      portrait: { cx: 1196, cy: 440, s: 1.06 },
      elevation: { cx: 1214, cy: 372, s: 1.42 },
      court: { cx: 1206, cy: 1012, s: 2.0 },
      deck: { cx: 1252, cy: 386, s: 2.35 },
      valley: { cx: 1528, cy: 706, s: 0.72 },
    },
  };
}

/* ------------------------------------------------------------------ *
 * Scene: low-slung mass, deep cantilever, water plane (villas, Luxofy)
 * ------------------------------------------------------------------ */

function sceneVilla(doc, R, opt) {
  const A = ACCENTS[opt.accent];
  const M = opt.mood;
  const L = [];

  L.push(poly(ridgeShape(R, { y: HORIZON + 4, amp: 170, step: 260, jag: 0.4 }), { fill: C.carbon850 }));
  L.push(groundPlane(doc, { near: PLANE[1], far: C.carbon850 }));
  L.push(path(treeLinePath(R, { y: HORIZON + 44, h: 86 }), { fill: "#0c0d10" }));

  const bx0 = 168;
  const bx1 = 664;
  const bTop = 660;
  const bBase = HORIZON + 176;
  const bPitch = 47;
  L.push(rect(bx0, bTop, bx1 - bx0, bBase - bTop, { fill: PLANE[1] }));
  const blockWin = windowPattern(doc, "winblk", {
    ox: bx0 + 14, oy: bTop + 10, cw: 30, ch: bPitch, ww: 17, wh: 22, fill: C.carbon950, opacity: 0.9,
  });
  L.push(rect(bx0 + 14, bTop + 10, bx1 - bx0 - 28, bBase - bTop - 26, { fill: blockWin }));
  L.push(
    litWindows(R, {
      x: bx0 + 14, y: bTop + 10, w: bx1 - bx0 - 28, h: bBase - bTop - 40,
      cw: 30, ch: bPitch, ww: 17, wh: 22, ratio: 0.28, color: A.lit, baseOp: M.litOp * 0.8, max: 26,
    }),
  );
  for (let i = 0; i < 7; i += 1) {
    L.push(rect(bx0 - 10, bTop + 10 + i * bPitch + 32, bx1 - bx0 + 20, 9, { fill: PLANE[2] }));
  }
  L.push(rimEdge(doc, "blkrim", { x: bx1 - 20, y: bTop, w: 24, h: bBase - bTop, color: A.rim, opacity: 0.4 }));

  const vx0 = 856;
  const vx1 = 1600;
  const slabY = 852;
  const groundY = 1004;
  const interior = linearGrad(doc, "interior", {
    x1: 0, y1: slabY + 24, x2: 0, y2: groundY,
    stops: [[0, A.lit, 0.42 + M.litOp * 0.3], [0.65, A.lit, 0.2], [1, C.carbon800, 0.9]],
  });
  L.push(rect(vx0 + 18, slabY + 24, vx1 - vx0 - 36, groundY - slabY - 24, { fill: interior }));
  for (let i = 0; i < 6; i += 1) {
    L.push(rect(vx0 + 46 + i * 124, slabY + 26, 8, groundY - slabY - 26, { fill: C.carbon900, "fill-opacity": "0.75" }));
  }

  L.push(rect(1412, 782, 190, 222, { fill: PLANE[2] }));
  L.push(rect(1412, 782, 190, 3, { fill: C.carbon400, "fill-opacity": "0.5" }));
  L.push(rimEdge(doc, "stonerim", { x: 1576, y: 782, w: 26, h: 222, color: A.rim, opacity: 0.62 }));

  L.push(rect(vx0 - 84, 796, 620, 22, { fill: PLANE[2] }));
  L.push(rect(vx0 - 84, slabY, vx1 - vx0 + 250, 30, { fill: PLANE[3] }));
  L.push(rect(vx0 - 84, slabY, vx1 - vx0 + 250, 3.4, { fill: A.rim, "fill-opacity": "0.55" }));
  L.push(rect(vx0 - 84, slabY + 27, vx1 - vx0 + 250, 3, { fill: C.carbon950, "fill-opacity": "0.6" }));

  for (let i = 0; i < 4; i += 1) {
    L.push(rect(vx0 + 72 + i * 232, slabY + 30, 9, groundY - slabY - 30, { fill: C.carbon600 }));
  }
  L.push(rect(vx0 - 120, groundY, vx1 - vx0 + 320, 26, { fill: PLANE[3] }));
  L.push(rect(vx0 - 120, groundY, vx1 - vx0 + 320, 2.6, { fill: C.carbon400, "fill-opacity": "0.45" }));

  const terrace = 1044;
  L.push(rect(EXT_L, terrace, EXT_R - EXT_L, 68, { fill: PLANE[1] }));
  L.push(rect(EXT_L, terrace, EXT_R - EXT_L, 2.4, { fill: C.carbon500, "fill-opacity": "0.5" }));
  for (let i = 0; i < 17; i += 1) {
    const hx = -240 + i * 170;
    const drift = R.range(-14, 14);
    if (hx > 760 && hx < 1700) continue;
    L.push(canopy(R, { cx: hx + drift, cy: terrace + 6, r: 56, fill: "#0a0c0e", opacity: 0.95, blobs: 4 }));
  }
  L.push(rect(EXT_L, terrace + 62, EXT_R - EXT_L, 26, { fill: PLANE[2] }));

  const poolTop = 1112;
  const poolBottom = 1520;
  const poolX0 = 620;
  const poolX1 = 1940;
  const clipId = doc.id("poolclip");
  doc.defs.push(
    `<clipPath id="${clipId}">${rect(poolX0, poolTop, poolX1 - poolX0, poolBottom - poolTop)}</clipPath>`,
  );
  const poolFill = linearGrad(doc, "pool", {
    x1: 0, y1: poolTop, x2: 0, y2: poolBottom,
    stops: [[0, "#1c2026", 1], [0.42, "#14171c", 1], [1, "#0b0c10", 1]],
  });
  L.push(rect(poolX0 - 26, poolTop - 10, poolX1 - poolX0 + 52, poolBottom - poolTop + 40, { fill: PLANE[3] }));
  L.push(rect(poolX0, poolTop, poolX1 - poolX0, poolBottom - poolTop, { fill: poolFill }));

  const mirrored =
    rect(vx0 - 84, slabY, vx1 - vx0 + 250, 30, { fill: A.rim, "fill-opacity": "0.85" }) +
    rect(vx0 + 18, slabY + 24, vx1 - vx0 - 36, groundY - slabY - 24, { fill: A.lit, "fill-opacity": "0.8" }) +
    rect(1412, 782, 190, 222, { fill: C.carbon400 }) +
    rect(bx0, bTop, bx1 - bx0, bBase - bTop, { fill: C.carbon500 });
  L.push(reflect(mirrored, { y0: poolTop, k: 0.62, opacity: 0.44, clipId }));
  L.push(
    group({ "clip-path": `url(#${clipId})` },
      ripples(R, { y0: poolTop + 8, y1: poolBottom - 20, x0: poolX0, x1: poolX1, color: A.rim, opacity: 0.26, count: 20 }),
    ),
  );
  const sheen = linearGrad(doc, "sheen", {
    x1: 0, y1: poolTop, x2: 0, y2: poolTop + 150,
    stops: [[0, A.rim, 0.22], [1, A.rim, 0]],
  });
  L.push(rect(poolX0, poolTop, poolX1 - poolX0, 150, { fill: sheen }));
  L.push(rect(poolX0, poolTop, poolX1 - poolX0, 3.4, { fill: A.rim, "fill-opacity": "0.55" }));
  L.push(rect(poolX0 - 26, poolBottom, poolX1 - poolX0 + 52, 30, { fill: PLANE[3] }));
  L.push(rect(poolX0 - 26, poolBottom, poolX1 - poolX0 + 52, 2.4, { fill: C.carbon400, "fill-opacity": "0.5" }));

  const palms = [
    { x: 742, y: 1090, h: 336, lean: -0.11 },
    { x: 1868, y: 1082, h: 398, lean: 0.08 },
    { x: 2072, y: 1112, h: 292, lean: -0.06 },
    { x: 2276, y: 1064, h: 344, lean: 0.05 },
  ];
  for (const p of palms) {
    L.push(palm(R, { ...p, stroke: "#07080a", width: 11, opacity: 1 }));
  }

  const approach = linearGrad(doc, "approach", {
    x1: 0, y1: 1150, x2: 0, y2: 1600,
    stops: [[0, C.carbon700, 0.5], [0.55, C.carbon600, 0.85], [1, C.carbon500, 0.9]],
  });
  L.push(poly([[2075, 1150], [2250, 1150], [2436, 1600], [1662, 1600]], { fill: approach }));
  L.push(
    path("M 2158 1150 L 2158 1600", {
      stroke: A.hair, "stroke-width": "3", "stroke-opacity": "0.26", "stroke-dasharray": "26 30", fill: "none",
    }),
  );
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5;
    const y = lerp(1180, 1560, t);
    const half = lerp(90, 384, t);
    for (const side of [-1, 1]) {
      L.push(rect(2158 + side * half - 4, y - lerp(18, 34, t), 8, lerp(18, 34, t), { fill: "#07080a" }));
      L.push(
        circle(2158 + side * half, y - lerp(20, 38, t), lerp(4, 7, t), {
          fill: A.lit,
          "fill-opacity": o(0.34 + 0.4 * M.litOp),
        }),
      );
    }
  }

  return {
    layers: L,
    focus: {
      wide: { cx: 1190, cy: 1010, s: 0.92 },
      portrait: { cx: 1180, cy: 930, s: 1.1 },
      elevation: { cx: 1150, cy: 950, s: 1.44 },
      block: { cx: 430, cy: 890, s: 1.3 },
      pool: { cx: 1260, cy: 1200, s: 1.62 },
      approach: { cx: 1930, cy: 1160, s: 1.16 },
    },
  };
}

/* ------------------------------------------------------------------ *
 * Scene: set-back masses, lit window grid, street arcade (commercial)
 * ------------------------------------------------------------------ */

function sceneCommercial(doc, R, opt) {
  const A = ACCENTS[opt.accent];
  const M = opt.mood;
  const L = [];

  L.push(groundPlane(doc, { near: PLANE[1], far: C.carbon850 }));

  const skyline = [
    { x: 120, w: 208, top: 322 }, { x: 372, w: 156, top: 448 }, { x: 572, w: 184, top: 250 },
    { x: 1790, w: 176, top: 296 }, { x: 2006, w: 214, top: 420 }, { x: 2262, w: 150, top: 214 },
    { x: -140, w: 200, top: 470 }, { x: 2452, w: 190, top: 388 },
  ];
  skyline.forEach((b, i) => {
    L.push(
      backBlock(doc, R, {
        name: `sb${i}`, x: b.x, w: b.w, top: b.top, base: HORIZON + 300,
        cw: 24, ch: 30, ww: 10, wh: 14, ratio: 0.2, lit: A.lit, litOp: M.litOp * 0.55, max: 14,
      }),
    );
  });

  const masses = [
    { x0: 960, x1: 1476, top: 40, base: 344, fill: PLANE[1], cw: 30, ch: 36, ww: 15, wh: 19, ratio: 0.3, max: 46, name: "m0" },
    { x0: 882, x1: 1608, top: 320, base: 668, fill: PLANE[2], cw: 32, ch: 38, ww: 17, wh: 21, ratio: 0.34, max: 58, name: "m1" },
    { x0: 812, x1: 1716, top: 644, base: 1104, fill: PLANE[3], cw: 34, ch: 40, ww: 18, wh: 22, ratio: 0.4, max: 70, name: "m2" },
  ];
  for (const m of masses) {
    const w = m.x1 - m.x0;
    const h = m.base - m.top;
    const face = linearGrad(doc, `face${m.name}`, {
      x1: m.x0, y1: 0, x2: m.x1, y2: 0,
      stops: [[0, C.carbon850], [0.4, m.fill], [1, C.carbon600]],
    });
    L.push(rect(m.x0, m.top, w, h, { fill: face }));
    const pat = windowPattern(doc, `pat${m.name}`, {
      ox: m.x0 + 16, oy: m.top + 16, cw: m.cw, ch: m.ch, ww: m.ww, wh: m.wh, fill: C.carbon950, opacity: 0.9,
    });
    L.push(rect(m.x0 + 16, m.top + 16, w - 32, h - 30, { fill: pat }));
    L.push(
      litWindows(R, {
        x: m.x0 + 16, y: m.top + 16, w: w - 32, h: h - 30,
        cw: m.cw, ch: m.ch, ww: m.ww, wh: m.wh, ratio: m.ratio, color: A.lit, baseOp: M.litOp, max: m.max,
      }),
    );
    L.push(rect(m.x0 - 14, m.top, w + 28, 12, { fill: C.carbon500 }));
    L.push(rect(m.x0 - 14, m.top, w + 28, 2.6, { fill: A.rim, "fill-opacity": "0.34" }));
    L.push(rimEdge(doc, `rim${m.name}`, { x: m.x1 - 28, y: m.top, w: 32, h, color: A.rim, opacity: 0.5 }));
  }
  L.push(rect(808, 916, 912, 6, { fill: A.hair, "fill-opacity": "0.42" }));

  const arcTop = 972;
  const arcBase = 1108;
  L.push(rect(796, arcTop - 18, 940, 20, { fill: PLANE[3] }));
  for (let i = 0; i < 8; i += 1) {
    const x = 816 + i * 114;
    const w = 84;
    const r = w / 2;
    const glow = linearGrad(doc, `bay${i}`, {
      x1: 0, y1: arcTop, x2: 0, y2: arcBase,
      stops: [[0, A.lit, 0.34 + M.litOp * 0.26], [1, A.lit, 0.05]],
    });
    L.push(
      path(
        `M ${n(x)} ${n(arcBase)} L ${n(x)} ${n(arcTop + r)} A ${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(arcTop + r)} L ${n(x + w)} ${n(arcBase)} Z`,
        { fill: glow },
      ),
    );
    L.push(rect(x + w, arcTop, 30, arcBase - arcTop, { fill: PLANE[3] }));
  }
  L.push(rect(796, arcBase, 940, 16, { fill: C.carbon600 }));

  const street = linearGrad(doc, "street", {
    x1: 0, y1: arcBase + 16, x2: 0, y2: GROUND_BOTTOM,
    stops: [[0, C.carbon800, 1], [0.35, C.carbon900, 1], [1, C.carbon950, 1]],
  });
  L.push(rect(EXT_L, arcBase + 16, EXT_R - EXT_L, GROUND_BOTTOM - arcBase - 16, { fill: street }));
  for (let i = 0; i < 9; i += 1) {
    L.push(
      ellipse(760 + i * 118, 1230 + R.range(-14, 26), 62, 20, {
        fill: A.lit,
        "fill-opacity": o(0.05 + 0.07 * M.litOp),
      }),
    );
  }
  for (let i = 0; i < 5; i += 1) {
    const x = 640 + i * 268;
    L.push(rect(x, 1058, 4, 232, { fill: C.carbon950, "fill-opacity": "0.8" }));
    L.push(circle(x + 2, 1052, 7, { fill: A.lit, "fill-opacity": o(0.3 + 0.4 * M.litOp) }));
  }

  return {
    layers: L,
    focus: {
      wide: { cx: 1208, cy: 600, s: 0.9 },
      portrait: { cx: 1206, cy: 560, s: 1.0 },
      frontage: { cx: 1204, cy: 930, s: 1.52 },
      arcade: { cx: 1140, cy: 1036, s: 2.3 },
      upper: { cx: 1256, cy: 352, s: 1.86 },
      skyline: { cx: 1312, cy: 548, s: 0.6 },
    },
  };
}

/* ------------------------------------------------------------------ *
 * Scene: contours, pitched roofs, canopies (sustainable living)
 * ------------------------------------------------------------------ */

function pitchedHouse({ x, base, w, h, roof, body, roofFill }) {
  const half = w / 2;
  return (
    rect(x - half, base - h, w, h, { fill: body }) +
    poly([[x - half - w * 0.1, base - h], [x, base - h - roof], [x + half + w * 0.1, base - h]], { fill: roofFill }) +
    rect(x - half - w * 0.1, base - h - 2, w * 1.2, 2.4, { fill: C.carbon400, "fill-opacity": "0.45" })
  );
}

function sceneEco(doc, R, opt) {
  const A = ACCENTS[opt.accent];
  const M = opt.mood;
  const L = [];

  L.push(poly(ridgeShape(R, { y: HORIZON + 2, amp: 240, step: 240, jag: 0.5 }), { fill: C.carbon850 }));
  L.push(poly(ridgeShape(R, { y: HORIZON + 26, amp: 132, step: 220, jag: 0.35 }), { fill: "#0d0f11" }));
  L.push(groundPlane(doc, { near: "#111412", far: C.carbon850 }));
  L.push(path(treeLinePath(R, { y: HORIZON + 40, h: 70 }), { fill: "#0b0d0c" }));

  for (let i = 0; i < 15; i += 1) {
    const t = i / 14;
    const y = HORIZON + 70 + Math.pow(t, 1.8) * 1400;
    const amp = lerp(14, 96, t);
    const ph = R.range(0, TAU);
    const points = [];
    for (let x = -700; x <= 3200; x += 240) {
      points.push([x, y + amp * Math.sin(x * 0.0012 + ph) + amp * 0.35 * Math.sin(x * 0.0037 + ph * 1.7)]);
    }
    L.push(
      pline(points, {
        stroke: C.sage400,
        "stroke-width": n(lerp(1, 2.6, t)),
        "stroke-opacity": o(lerp(0.12, 0.3, t)),
      }),
    );
  }

  const clusterB = [
    { x: 1596, base: 918, w: 88, h: 46, roof: 32 },
    { x: 1704, base: 926, w: 76, h: 40, roof: 28 },
    { x: 1802, base: 914, w: 96, h: 48, roof: 34 },
    { x: 558, base: 928, w: 82, h: 44, roof: 30 },
    { x: 660, base: 938, w: 94, h: 50, roof: 34 },
  ];
  for (const h of clusterB) {
    L.push(pitchedHouse({ ...h, body: PLANE[1], roofFill: C.carbon850 }));
  }

  const clusterA = [
    { x: 812, base: 962, w: 118, h: 62, roof: 44 },
    { x: 946, base: 978, w: 96, h: 54, roof: 38 },
    { x: 1074, base: 996, w: 134, h: 70, roof: 50 },
    { x: 1226, base: 972, w: 104, h: 58, roof: 40 },
    { x: 1352, base: 1000, w: 126, h: 66, roof: 46 },
  ];
  for (const h of clusterA) {
    L.push(pitchedHouse({ ...h, body: PLANE[3], roofFill: PLANE[2] }));
    L.push(
      rect(h.x - h.w * 0.32, h.base - h.h * 0.72, h.w * 0.44, h.h * 0.44, {
        fill: A.lit,
        "fill-opacity": o(0.26 + 0.5 * M.litOp),
      }),
    );
    L.push(rect(h.x + h.w * 0.5 - 3, h.base - h.h, 3.4, h.h, { fill: A.rim, "fill-opacity": "0.4" }));
  }

  const canopies = [
    { cx: 470, cy: 1008, r: 74 }, { cx: 1500, cy: 986, r: 62 }, { cx: 1912, cy: 964, r: 56 },
    { cx: 300, cy: 1062, r: 92 }, { cx: 2060, cy: 1032, r: 86 }, { cx: 1656, cy: 1076, r: 104 },
    { cx: 760, cy: 1132, r: 118 }, { cx: 2260, cy: 1130, r: 128 }, { cx: 140, cy: 1180, r: 136 },
  ];
  for (const t of canopies) {
    L.push(canopy(R, { cx: t.cx, cy: t.cy, r: t.r, fill: "#070a08", opacity: 1, blobs: 5 }));
    L.push(canopy(R, { cx: t.cx - t.r * 0.3, cy: t.cy - t.r * 0.34, r: t.r * 0.34, fill: C.sage500, opacity: 0.14, blobs: 2 }));
  }

  const waterClip = doc.id("waterclip");
  doc.defs.push(`<clipPath id="${waterClip}">${ellipse(636, 1178, 300, 78)}</clipPath>`);
  const courtFill = linearGrad(doc, "court", {
    x1: 0, y1: 1100, x2: 0, y2: 1256,
    stops: [[0, "#1d2228", 1], [0.45, "#141920", 1], [1, "#0b0d11", 1]],
  });
  L.push(ellipse(636, 1184, 318, 88, { fill: PLANE[2] }));
  L.push(ellipse(636, 1178, 300, 78, { fill: courtFill }));
  L.push(
    group({ "clip-path": `url(#${waterClip})` },
      ripples(R, { y0: 1112, y1: 1244, x0: 350, x1: 920, color: A.rim, opacity: 0.34, count: 14 }),
    ),
  );
  L.push(ellipse(636, 1178, 300, 78, { fill: "none", stroke: A.rim, "stroke-width": "2.4", "stroke-opacity": "0.42" }));

  const walk = "M -260 1640 Q 620 1430 1180 1320 Q 1760 1212 2480 1186";
  L.push(path(walk, { fill: "none", stroke: C.carbon500, "stroke-width": "38", "stroke-opacity": "0.7", "stroke-linecap": "round" }));
  L.push(path(walk, { fill: "none", stroke: A.hair, "stroke-width": "2", "stroke-opacity": "0.3", "stroke-dasharray": "22 26" }));

  for (let i = 0; i < 26; i += 1) {
    const x = -300 + i * 112 + R.range(-26, 26);
    const y = 1440 + R.range(-40, 200);
    L.push(rect(x, y, 2.6, R.range(26, 64), { fill: C.sage400, "fill-opacity": "0.24" }));
  }

  L.push(path(treeLinePath(R, { y: 1620, h: 150, depth: 900 }), { fill: "#050706" }));
  for (const t of [{ cx: 210, cy: 1592, r: 224 }, { cx: 2150, cy: 1650, r: 262 }]) {
    L.push(canopy(R, { cx: t.cx, cy: t.cy, r: t.r, fill: "#050706", opacity: 1, blobs: 6 }));
  }

  return {
    layers: L,
    focus: {
      wide: { cx: 1140, cy: 980, s: 0.94 },
      portrait: { cx: 1120, cy: 900, s: 1.1 },
      cluster: { cx: 1064, cy: 950, s: 1.58 },
      green: { cx: 1740, cy: 986, s: 1.3 },
      water: { cx: 648, cy: 1140, s: 1.72 },
      walk: { cx: 1266, cy: 1266, s: 1.42 },
    },
  };
}

/* ------------------------------------------------------------------ *
 * Scene: still pool, colonnade in perspective, low sun (spiritual)
 * ------------------------------------------------------------------ */

function sceneSerene(doc, R, opt) {
  const A = ACCENTS[opt.accent];
  const L = [];

  L.push(poly(ridgeShape(R, { y: HORIZON + 2, amp: 360, step: 240, jag: 0.28 }), { fill: "#101018" }));
  L.push(poly(ridgeShape(R, { y: HORIZON + 20, amp: 205, step: 230, jag: 0.22 }), { fill: "#0c0c11" }));
  L.push(groundPlane(doc, { near: PLANE[1], far: C.carbon850 }));

  const sunX = CENTER_X;
  const sunY = HORIZON - 56;
  const sunFill = radialGrad(doc, "sun", {
    cx: sunX, cy: sunY, r: 340,
    stops: [[0, A.rim, 0.6], [0.16, A.rim, 0.32], [0.5, A.glow, 0.12], [1, A.glow, 0]],
  });
  L.push(circle(sunX, sunY, 340, { fill: sunFill }));
  L.push(circle(sunX, sunY, 44, { fill: A.rim, "fill-opacity": "0.5" }));
  L.push(path(treeLinePath(R, { y: HORIZON + 38, h: 44 }), { fill: "#090a0d" }));

  const pavZ = 6200;
  const [pavX, pavY] = ground(0, pavZ);
  L.push(rect(pavX - rise(520, pavZ), pavY - rise(120, pavZ), rise(1040, pavZ), rise(120, pavZ), { fill: PLANE[1] }));

  const depths = [];
  for (let i = 0; i < 8; i += 1) depths.push(1180 * Math.pow(1.3, i));
  const pierH = 460;
  const pierW = 82;
  const pierX = 430;
  const lintel = 44;
  const colonnade = [];
  for (let i = depths.length - 1; i >= 0; i -= 1) {
    const z = depths[i];
    const near = 1 - i / depths.length;
    const shade = i > 5 ? PLANE[0] : i > 3 ? PLANE[1] : i > 1 ? PLANE[2] : PLANE[3];
    if (i < depths.length - 1) {
      const zB = depths[i + 1];
      for (const side of [-1, 1]) {
        const [ax, ay] = ground(side * pierX, z);
        const [bx, by] = ground(side * pierX, zB);
        colonnade.push(
          poly(
            [
              [ax, ay - rise(pierH, z)],
              [bx, by - rise(pierH, zB)],
              [bx, by - rise(pierH + lintel, zB)],
              [ax, ay - rise(pierH + lintel, z)],
            ],
            { fill: shade, "fill-opacity": "0.92" },
          ),
        );
      }
    }
    for (const side of [-1, 1]) {
      const [gx, gy] = ground(side * pierX, z);
      const w = rise(pierW, z);
      const h = rise(pierH, z);
      colonnade.push(rect(gx - w / 2, gy - h, w, h, { fill: shade }));
      colonnade.push(rect(gx - w / 2, gy - h, w, Math.max(1.4, rise(14, z)), { fill: C.carbon400, "fill-opacity": "0.5" }));
      colonnade.push(rect(gx - w * 0.78, gy - rise(20, z), w * 1.56, rise(20, z), { fill: shade }));
      if (side === 1) {
        colonnade.push(
          rect(gx + w / 2 - Math.max(1.2, w * 0.16), gy - h, Math.max(1.2, w * 0.16), h, {
            fill: A.rim,
            "fill-opacity": o(0.14 + 0.34 * near),
          }),
        );
      }
    }
  }
  const colonnadeSvg = colonnade.join("");
  L.push(colonnadeSvg);

  const poolTop = ground(0, 1150)[1];
  const poolClip = doc.id("poolclip");
  doc.defs.push(`<clipPath id="${poolClip}">${rect(EXT_L, poolTop, EXT_R - EXT_L, GROUND_BOTTOM - poolTop)}</clipPath>`);
  const poolFill = linearGrad(doc, "pool", {
    x1: 0, y1: poolTop, x2: 0, y2: poolTop + 760,
    stops: [[0, C.carbon800, 1], [0.45, "#0b0b0f", 1], [1, C.carbon950, 1]],
  });
  L.push(rect(EXT_L, poolTop, EXT_R - EXT_L, GROUND_BOTTOM - poolTop, { fill: poolFill }));

  const sunPath = linearGrad(doc, "sunpath", {
    x1: 0, y1: poolTop, x2: 0, y2: poolTop + 660,
    stops: [[0, A.rim, 0.34], [0.5, A.rim, 0.14], [1, A.rim, 0]],
  });
  L.push(
    group({ "clip-path": `url(#${poolClip})` },
      poly([[sunX - 58, poolTop], [sunX + 58, poolTop], [sunX + 280, poolTop + 660], [sunX - 280, poolTop + 660]], { fill: sunPath }) +
        reflect(colonnadeSvg, { y0: poolTop, k: 0.5, opacity: 0.2 }) +
        ripples(R, { y0: poolTop + 12, y1: poolTop + 680, x0: 180, x1: 2240, color: A.rim, opacity: 0.2, count: 20 }),
    ),
  );
  L.push(rect(EXT_L, poolTop - 14, EXT_R - EXT_L, 14, { fill: PLANE[2] }));
  L.push(rect(EXT_L, poolTop, EXT_R - EXT_L, 2.6, { fill: A.hair, "fill-opacity": "0.3" }));
  L.push(rect(EXT_L, 1460, EXT_R - EXT_L, 260, { fill: C.carbon950, "fill-opacity": "0.88" }));
  L.push(rect(EXT_L, 1460, EXT_R - EXT_L, 3, { fill: A.hair, "fill-opacity": "0.22" }));

  return {
    layers: L,
    focus: {
      wide: { cx: 1200, cy: 900, s: 0.95 },
      portrait: { cx: 1200, cy: 880, s: 1.2 },
      court: { cx: 1200, cy: 960, s: 1.5 },
      colonnade: { cx: 1440, cy: 800, s: 1.7 },
    },
  };
}

/* ------------------------------------------------------------------ *
 * Scene: plotted grid in one-point perspective over open land
 * ------------------------------------------------------------------ */

function scenePlots(doc, R, opt) {
  const A = ACCENTS[opt.accent];
  const M = opt.mood;
  const L = [];

  L.push(poly(ridgeShape(R, { y: HORIZON + 4, amp: 196, step: 250, jag: 0.4 }), { fill: C.carbon850 }));
  L.push(groundPlane(doc, { near: "#121317", far: C.carbon850 }));
  L.push(path(treeLinePath(R, { y: HORIZON + 34, h: 64 }), { fill: "#0a0c0c" }));

  const zNear = 430;
  const zFar = 5200;
  const halfW = 980;
  const roadHalf = 88;

  const roadFill = linearGrad(doc, "road", {
    x1: 0, y1: ground(0, zFar)[1], x2: 0, y2: ground(0, zNear)[1],
    stops: [[0, C.carbon700, 0.5], [0.55, C.carbon600, 0.8], [1, C.carbon500, 0.85]],
  });
  L.push(
    poly(
      [
        [ground(-roadHalf, zNear)[0], ground(0, zNear)[1]],
        [ground(roadHalf, zNear)[0], ground(0, zNear)[1]],
        [ground(roadHalf, zFar)[0], ground(0, zFar)[1]],
        [ground(-roadHalf, zFar)[0], ground(0, zFar)[1]],
      ],
      { fill: roadFill },
    ),
  );
  for (let i = 0; i < 12; i += 1) {
    const z0 = zNear * Math.pow(1.24, i);
    const z1 = z0 * 1.12;
    if (z1 > zFar) break;
    const [ax, ay] = ground(0, z0);
    const [bx, by] = ground(0, z1);
    L.push(line(ax, ay, bx, by, { stroke: A.hair, "stroke-width": n(Math.max(1, rise(5, z0))), "stroke-opacity": "0.34" }));
  }

  for (let X = -halfW; X <= halfW; X += 140) {
    if (Math.abs(X) <= roadHalf) continue;
    const [ax, ay] = ground(X, zNear);
    const [bx, by] = ground(X, zFar);
    L.push(
      line(ax, ay, bx, by, {
        stroke: C.steel500,
        "stroke-width": "1.6",
        "stroke-opacity": o(Math.abs(Math.abs(X) - halfW) < 1 ? 0.4 : 0.2),
      }),
    );
  }

  const depthSteps = [];
  for (let i = 0; i < 12; i += 1) {
    const z = zNear * Math.pow(1.235, i);
    if (z > zFar) break;
    depthSteps.push(z);
  }
  for (const z of depthSteps) {
    const [ax, ay] = ground(-halfW, z);
    const [bx] = ground(halfW, z);
    L.push(line(ax, ay, bx, ay, { stroke: C.steel500, "stroke-width": n(Math.max(1, rise(2.4, z))), "stroke-opacity": "0.22" }));
  }

  for (const z of depthSteps.slice(0, 7)) {
    for (let X = -halfW; X <= halfW; X += 280) {
      if (Math.abs(X) <= roadHalf) continue;
      const [mx, my] = ground(X, z);
      const h = rise(22, z);
      L.push(rect(mx - 1.4, my - h, 2.8, h, { fill: A.hair, "fill-opacity": "0.34" }));
    }
  }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 16; i += 1) {
      const z = zNear * Math.pow(1.18, i);
      if (z > zFar) break;
      const [px, py] = ground(side * (halfW + 60), z);
      const pw = Math.max(1, rise(4, z));
      const ph = rise(58, z);
      L.push(rect(px - pw / 2, py - ph, pw, ph, { fill: C.carbon950, "fill-opacity": "0.85" }));
    }
    const [e0x, e0y] = ground(side * (halfW + 60), zNear);
    const [e1x, e1y] = ground(side * (halfW + 60), zFar);
    L.push(
      line(e0x, e0y - rise(46, zNear), e1x, e1y - rise(46, zFar), {
        stroke: C.steel500,
        "stroke-width": "1.8",
        "stroke-opacity": "0.28",
      }),
    );
  }

  for (let i = 0; i < 14; i += 1) {
    const z = zNear * Math.pow(1.2, i);
    if (z > zFar) break;
    for (const side of [-1, 1]) {
      const [tx, ty] = ground(side * (halfW + 160), z);
      const r = Math.max(7, rise(165, z));
      L.push(rect(tx - Math.max(1.4, rise(9, z)) / 2, ty - r * 1.1, Math.max(1.4, rise(9, z)), r * 1.1, { fill: "#060907" }));
      L.push(canopy(R, { cx: tx, cy: ty - r * 1.28, r, fill: "#060907", opacity: 1, blobs: 4 }));
      L.push(
        canopy(R, {
          cx: tx - r * 0.3, cy: ty - r * 1.5, r: r * 0.34, fill: C.sage500, opacity: 0.16, blobs: 2,
        }),
      );
    }
  }

  const villaZ = 2200;
  const [vxc, vy] = ground(560, villaZ);
  const vw = rise(620, villaZ);
  const vh = rise(150, villaZ);
  L.push(rect(vxc - vw / 2, vy - vh, vw, vh, { fill: PLANE[1] }));
  L.push(rect(vxc - vw * 0.56, vy - vh - rise(22, villaZ), vw * 1.12, rise(22, villaZ), { fill: PLANE[2] }));
  L.push(rect(vxc + vw * 0.16, vy - vh * 1.5, vw * 0.26, vh * 0.52, { fill: PLANE[2] }));
  L.push(rect(vxc - vw * 0.3, vy - vh * 0.74, vw * 0.42, vh * 0.46, { fill: A.lit, "fill-opacity": o(0.18 + 0.5 * M.litOp) }));
  L.push(rect(vxc + vw / 2 - 3, vy - vh, 3.4, vh, { fill: A.rim, "fill-opacity": "0.5" }));

  const gateZ = 640;
  const gateH = 150;
  const gatePw = rise(40, gateZ);
  const gatePh = rise(gateH, gateZ);
  for (const side of [-1, 1]) {
    const [px, py] = ground(side * 186, gateZ);
    L.push(rect(px - gatePw / 2, py - gatePh, gatePw, gatePh, { fill: PLANE[3] }));
    L.push(rect(px - gatePw / 2, py - gatePh, gatePw, 4, { fill: A.rim, "fill-opacity": "0.55" }));
    L.push(
      rect(px - gatePw * 0.32, py - gatePh * 0.66, gatePw * 0.2, gatePh * 0.4, {
        fill: A.lit,
        "fill-opacity": o(0.24 + 0.4 * M.litOp),
      }),
    );
  }
  const [glx, gly] = ground(-186, gateZ);
  const [grx] = ground(186, gateZ);
  L.push(rect(glx - gatePw / 2, gly - gatePh - 14, grx - glx + gatePw, 16, { fill: PLANE[3] }));
  L.push(rect(glx - gatePw / 2, gly - gatePh - 14, grx - glx + gatePw, 3, { fill: A.rim, "fill-opacity": "0.5" }));

  for (let i = 0; i < 40; i += 1) {
    const X = R.range(-halfW - 120, halfW + 120);
    const z = R.range(zNear * 0.86, 1500);
    const [gx, gy] = ground(X, z);
    L.push(rect(gx, gy, Math.max(1.2, rise(3, z)), rise(R.range(8, 22), z), { fill: C.sage400, "fill-opacity": "0.26" }));
  }

  L.push(path(treeLinePath(R, { y: 1478, h: 66, depth: 900 }), { fill: "#050706" }));
  for (const t of [{ cx: 150, cy: 1520, r: 250 }, { cx: 2280, cy: 1560, r: 276 }]) {
    L.push(canopy(R, { cx: t.cx, cy: t.cy, r: t.r, fill: "#050706", opacity: 1, blobs: 6 }));
  }

  return {
    layers: L,
    focus: {
      wide: { cx: 1200, cy: 900, s: 0.9 },
      portrait: { cx: 1200, cy: 950, s: 1.04 },
      parcel: { cx: 1150, cy: 1010, s: 1.38 },
      road: { cx: 1200, cy: 940, s: 1.26 },
      edge: { cx: 1960, cy: 940, s: 1.32 },
      gate: { cx: 1200, cy: 1160, s: 1.6 },
      villa: { cx: vxc, cy: vy - vh * 0.5, s: 2.6 },
      horizon: { cx: 1268, cy: 812, s: 0.74 },
    },
  };
}

const SCENES = {
  tower: sceneTower,
  villa: sceneVilla,
  commercial: sceneCommercial,
  eco: sceneEco,
  serene: sceneSerene,
  plots: scenePlots,
};

/* ------------------------------------------------------------------ *
 * Composition
 * ------------------------------------------------------------------ */

function compose({ key, width, height, title, desc, scene, place, accent, mood, focus, sceneOpts = {} }) {
  const M = MOODS[mood];
  const A = ACCENTS[accent];
  if (!M) throw new Error(`unknown mood: ${mood}`);
  if (!A) throw new Error(`unknown accent: ${accent}`);

  const doc = createDoc({ key, width, height, title, desc });
  const R = makeRng(place);
  const built = SCENES[scene](doc, R, { accent, mood: M, ...sceneOpts });
  const f = built.focus[focus];
  if (!f) throw new Error(`${scene} has no focus "${focus}"`);

  const cam = { s: f.s, cx: f.cx, cy: f.cy, w: width, h: height };
  addSky(doc, cam, M, A);
  doc.parts.push(
    group(
      {
        transform:
          `translate(${n(width / 2 - cam.cx * cam.s)} ${n(height / 2 - cam.cy * cam.s)}) scale(${n(cam.s)})`,
      },
      built.layers.join(""),
    ),
  );
  addOverlays(doc, M, A);
  return renderDoc(doc);
}

/* ------------------------------------------------------------------ *
 * Masterplan — orthographic site plan under the interactive plot picker.
 * Plot bands match the `plan` percentages in src/content/projects.ts:
 * columns at x = 8,20,32,44,56,68 and rows at y = 12,40,68, each w=9 h=11.
 * ------------------------------------------------------------------ */

const PLOT_COLS = [8, 20, 32, 44, 56, 68];
const PLOT_ROWS = [12, 40, 68];
const PLOT_W = 9;
const PLOT_H = 11;

function buildMasterplan() {
  const W = 1400;
  const H = 900;
  const doc = createDoc({
    key: "garden-court-masterplan",
    width: W,
    height: H,
    title: "Garden Court — indicative plotted layout",
    desc:
      "Indicative site plan: three rows of plot bands served by internal roads and two planted " +
      "boulevards, with a landscaped edge, a planted boundary and an entrance court to the south.",
  });
  const R = makeRng("garden-court-masterplan");
  const A = ACCENTS.sage;
  const px = (p) => (p / 100) * W;
  const py = (p) => (p / 100) * H;
  const font = "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";

  const paper = linearGrad(doc, "paper", {
    x1: 0, y1: 0, x2: W, y2: H,
    stops: [[0, "#0b0c0e"], [0.48, C.carbon900], [1, C.carbon950]],
  });
  doc.parts.push(rect(0, 0, W, H, { fill: paper }));
  const lamp = radialGrad(doc, "lamp", {
    cx: W * 0.34, cy: H * 0.3, r: W * 0.82,
    stops: [[0, C.gold400, 0.13], [0.45, C.gold400, 0.05], [1, C.gold400, 0]],
  });
  doc.parts.push(rect(0, 0, W, H, { fill: lamp }));

  const L = [];
  const bandLeft = px(PLOT_COLS[0]);
  const bandRight = px(PLOT_COLS[5] + PLOT_W);
  const bandTop = py(PLOT_ROWS[0]);
  const bandBottom = py(PLOT_ROWS[2] + PLOT_H);
  const ROAD = px(3);
  const entryX = (bandLeft + bandRight) / 2;

  L.push(rect(40, 36, W - 80, H - 72, { fill: "#0c0e0d", "fill-opacity": "0.55" }));

  for (const z of [
    { x: 40, y: 36, w: W - 80, h: bandTop - ROAD - 36 },
    { x: bandRight + ROAD, y: 36, w: W - 40 - (bandRight + ROAD), h: H - 72 },
    { x: 40, y: bandBottom + ROAD, w: W - 80, h: H - 36 - (bandBottom + ROAD) },
    { x: 40, y: 36, w: bandLeft - ROAD - 40, h: H - 72 },
  ]) {
    if (z.w <= 0 || z.h <= 0) continue;
    L.push(rect(z.x, z.y, z.w, z.h, { fill: C.sage500, "fill-opacity": "0.12" }));
  }

  for (let i = 0; i < 7; i += 1) {
    const points = [];
    for (let x = 40; x <= W - 40; x += 48) {
      points.push([x, 50 + i * 5.6 + 9 * Math.sin(x * 0.011 + i * 0.7)]);
    }
    L.push(pline(points, { stroke: C.sage400, "stroke-width": "1", "stroke-opacity": "0.14" }));
  }
  for (let i = 0; i < 6; i += 1) {
    const points = [];
    for (let y = 40; y <= H - 40; y += 44) {
      points.push([bandRight + 56 + i * 15 + 8 * Math.sin(y * 0.014 + i), y]);
    }
    L.push(pline(points, { stroke: C.sage400, "stroke-width": "1", "stroke-opacity": "0.14" }));
  }

  const roadBand = (x, y, w, h) => {
    L.push(rect(x, y, w, h, { fill: C.carbon600 }));
    L.push(rect(x, y, w, h, { fill: "none", stroke: C.steel500, "stroke-width": "0.9", "stroke-opacity": "0.5" }));
  };
  roadBand(bandLeft - ROAD, bandTop - ROAD, bandRight - bandLeft + ROAD * 2, ROAD);
  roadBand(bandLeft - ROAD, bandBottom, bandRight - bandLeft + ROAD * 2, ROAD);
  roadBand(bandLeft - ROAD, bandTop - ROAD, ROAD, bandBottom - bandTop + ROAD * 2);
  roadBand(bandRight, bandTop - ROAD, ROAD, bandBottom - bandTop + ROAD * 2);
  for (let i = 0; i < PLOT_COLS.length - 1; i += 1) {
    const x0 = px(PLOT_COLS[i] + PLOT_W);
    roadBand(x0, bandTop - ROAD, px(PLOT_COLS[i + 1]) - x0, bandBottom - bandTop + ROAD * 2);
  }

  for (let i = 0; i < PLOT_ROWS.length - 1; i += 1) {
    const gapTop = py(PLOT_ROWS[i] + PLOT_H);
    const gapBottom = py(PLOT_ROWS[i + 1]);
    const mid = (gapTop + gapBottom) / 2;
    const carriage = 64;
    L.push(rect(bandLeft - ROAD, mid - carriage / 2, bandRight - bandLeft + ROAD * 2, carriage, { fill: C.carbon500 }));
    L.push(
      rect(bandLeft - ROAD, mid - carriage / 2, bandRight - bandLeft + ROAD * 2, carriage, {
        fill: "none", stroke: C.steel400, "stroke-width": "1", "stroke-opacity": "0.5",
      }),
    );
    L.push(
      line(bandLeft - ROAD, mid, bandRight + ROAD, mid, {
        stroke: C.gold400, "stroke-width": "1.4", "stroke-opacity": "0.3", "stroke-dasharray": "20 18",
      }),
    );
    for (let t = 0; t < 22; t += 1) {
      const cx = bandLeft + 18 + t * ((bandRight - bandLeft - 36) / 21);
      L.push(circle(cx, gapTop + 20, 9, { fill: C.sage500, "fill-opacity": "0.26" }));
      L.push(circle(cx, gapBottom - 20, 9, { fill: C.sage500, "fill-opacity": "0.26" }));
    }
  }

  L.push(rect(entryX - 34, bandBottom + ROAD, 68, H - 36 - (bandBottom + ROAD), { fill: C.carbon600 }));
  L.push(
    rect(entryX - 34, bandBottom + ROAD, 68, H - 36 - (bandBottom + ROAD), {
      fill: "none", stroke: C.steel500, "stroke-width": "0.8", "stroke-opacity": "0.34",
    }),
  );
  L.push(ellipse(entryX, H - 96, 96, 54, { fill: C.carbon600 }));
  L.push(ellipse(entryX, H - 96, 96, 54, { fill: "none", stroke: C.gold400, "stroke-width": "1.2", "stroke-opacity": "0.34" }));
  L.push(ellipse(entryX, H - 96, 40, 22, { fill: C.sage500, "fill-opacity": "0.22" }));
  for (const side of [-1, 1]) {
    L.push(rect(entryX + side * 62 - 9, H - 62, 18, 28, { fill: C.carbon500 }));
    L.push(rect(entryX + side * 62 - 9, H - 62, 18, 3, { fill: C.gold400, "fill-opacity": "0.55" }));
  }

  for (const rowPct of PLOT_ROWS) {
    for (const colPct of PLOT_COLS) {
      const x = px(colPct);
      const y = py(rowPct);
      const w = px(PLOT_W);
      const h = py(PLOT_H);
      L.push(rect(x, y, w, h, { fill: C.carbon800 }));
      L.push(rect(x, y, w, h, { fill: "none", stroke: C.steel400, "stroke-width": "1", "stroke-opacity": "0.45" }));
      L.push(
        rect(x + 9, y + 9, w - 18, h - 18, {
          fill: "none", stroke: C.steel400, "stroke-width": "0.7", "stroke-opacity": "0.2", "stroke-dasharray": "5 6",
        }),
      );
      L.push(rect(x, y + h - 4, w, 4, { fill: C.gold400, "fill-opacity": "0.16" }));
    }
  }

  for (let i = 0; i < 44; i += 1) {
    const zone = R.int(0, 3);
    let cx;
    let cy;
    if (zone === 0) {
      cx = R.range(60, W - 60);
      cy = R.range(50, Math.max(52, bandTop - ROAD - 14));
    } else if (zone === 1) {
      cx = R.range(bandRight + ROAD + 12, W - 54);
      cy = R.range(56, H - 56);
    } else if (zone === 2) {
      cx = R.range(60, W - 60);
      cy = R.range(bandBottom + ROAD + 14, H - 52);
    } else {
      cx = R.range(54, Math.max(56, bandLeft - ROAD - 12));
      cy = R.range(56, H - 56);
    }
    const r = R.range(9, 20);
    if (cx > entryX - 74 && cx < entryX + 74 && cy > bandBottom) continue;
    if (cx > bandRight + 60 && cx < W - 46 && cy > 286 && cy < 466) continue;
    L.push(circle(cx, cy, r, { fill: "#101a12", "fill-opacity": "0.9" }));
    L.push(circle(cx - r * 0.24, cy - r * 0.26, r * 0.55, { fill: C.sage400, "fill-opacity": "0.2" }));
  }

  const amenityX = bandRight + ROAD + 40;
  const amenityW = W - 52 - amenityX;
  L.push(rect(amenityX, 300, amenityW, 150, { fill: C.carbon700 }));
  L.push(rect(amenityX, 300, amenityW, 150, { fill: "none", stroke: C.gold400, "stroke-width": "1", "stroke-opacity": "0.3" }));
  L.push(rect(amenityX + 14, 314, amenityW - 28, 42, { fill: C.carbon600 }));
  L.push(ellipse(amenityX + amenityW / 2, 510, amenityW * 0.34, 32, { fill: C.steel500, "fill-opacity": "0.22" }));
  L.push(
    ellipse(amenityX + amenityW / 2, 510, amenityW * 0.34, 32, {
      fill: "none", stroke: C.steel400, "stroke-width": "0.9", "stroke-opacity": "0.3",
    }),
  );

  L.push(
    rect(40, 36, W - 80, H - 72, {
      fill: "none", stroke: C.gold400, "stroke-width": "1.6", "stroke-opacity": "0.34", "stroke-dasharray": "16 10",
    }),
  );

  const nx = W - 92;
  const ny = 104;
  L.push(circle(nx, ny, 34, { fill: "none", stroke: C.steel500, "stroke-width": "1", "stroke-opacity": "0.4" }));
  L.push(poly([[nx, ny - 30], [nx + 11, ny + 12], [nx, ny + 3], [nx - 11, ny + 12]], { fill: C.gold400, "fill-opacity": "0.8" }));
  L.push(
    el("text", {
      x: nx, y: ny + 54, fill: C.steel300, "fill-opacity": "0.75", "font-size": "15",
      "font-family": font, "letter-spacing": "3", "text-anchor": "middle",
    }, "N"),
  );

  const sx = 78;
  const sy = H - 62;
  const segW = 34;
  for (let i = 0; i < 6; i += 1) {
    L.push(rect(sx + i * segW, sy, segW, 7, { fill: i % 2 === 0 ? C.bone300 : C.carbon600, "fill-opacity": "0.7" }));
  }
  L.push(rect(sx, sy, segW * 6, 7, { fill: "none", stroke: C.steel400, "stroke-width": "0.8", "stroke-opacity": "0.5" }));
  for (let i = 0; i <= 6; i += 1) {
    L.push(line(sx + i * segW, sy + 7, sx + i * segW, sy + 13, { stroke: C.steel400, "stroke-width": "0.8", "stroke-opacity": "0.5" }));
  }
  L.push(
    el("text", {
      x: sx, y: sy - 12, fill: C.steel300, "fill-opacity": "0.7", "font-size": "12",
      "font-family": font, "letter-spacing": "3.4",
    }, "SCALE — INDICATIVE"),
  );
  L.push(
    el("text", {
      x: 78, y: 72, fill: C.gold400, "fill-opacity": "0.6", "font-size": "13",
      "font-family": font, "letter-spacing": "4.4",
    }, "INDICATIVE LAYOUT"),
  );

  doc.parts.push(L.join(""));
  addOverlays(doc, MOODS.night, A);
  return renderDoc(doc);
}

/* ------------------------------------------------------------------ *
 * Job table — output paths mirror src/content/*.ts exactly
 * ------------------------------------------------------------------ */

const CATEGORY_JOBS = [
  {
    file: "categories/apartments.svg", key: "cat-apartments", scene: "tower", place: "category:apartments",
    accent: "gold", mood: "dusk", focus: "portrait",
    title: "Apartments — abstract tower elevation",
    desc: "Stacked slabs and balcony rhythm on a lit tower mass above a low horizon.",
  },
  {
    file: "categories/villas.svg", key: "cat-villas", scene: "villa", place: "category:villas",
    accent: "gold", mood: "gold", focus: "portrait",
    title: "Villas — abstract low-slung elevation",
    desc: "A cantilevered villa mass mirrored in a still water plane, framed by palms.",
  },
  {
    file: "categories/commercial.svg", key: "cat-commercial", scene: "commercial", place: "category:commercial",
    accent: "steel", mood: "night", focus: "portrait",
    title: "Commercial Spaces — abstract lit facade",
    desc: "Set-back masses carrying a dense grid of lit windows above a street-level arcade.",
  },
  {
    file: "categories/sustainable-living.svg", key: "cat-sustainable", scene: "eco", place: "category:sustainable",
    accent: "sage", mood: "dawn", focus: "portrait",
    title: "Sustainable Living — abstract landscape community",
    desc: "Clustered pitched roofs set into contoured land with overlapping tree canopies.",
  },
  {
    file: "categories/spiritual-residences.svg", key: "cat-spiritual", scene: "serene", place: "category:spiritual",
    accent: "lotus", mood: "dusk", focus: "portrait",
    title: "Spiritual Residences — abstract water court",
    desc: "A still reflecting pool held by an open colonnade, a distant ridge and a single low sun.",
  },
  {
    file: "categories/plots.svg", key: "cat-plots", scene: "plots", place: "category:plots",
    accent: "sage", mood: "blue", focus: "portrait",
    title: "Plots — abstract plotted land",
    desc: "A plotted grid in one-point perspective over open land, closed by a tree line.",
  },
];

const PROJECT_JOBS = [
  {
    slug: "omaxe-chowk", scene: "commercial", accent: "steel", place: "project:omaxe-chowk", label: "Omaxe Chowk",
    views: [
      { file: "hero", focus: "wide", mood: "night", note: "a commercial frontage in a dense trade district" },
      { file: "gallery-01", focus: "frontage", mood: "night", note: "the retail frontage" },
      { file: "gallery-02", focus: "arcade", mood: "dusk", note: "an internal trade arcade" },
      { file: "gallery-03", focus: "upper", mood: "blue", note: "the upper-floor units" },
      { file: "gallery-04", focus: "skyline", mood: "dusk", note: "the district skyline" },
    ],
  },
  {
    slug: "luxofy", scene: "villa", accent: "gold", place: "project:luxofy", label: "Luxofy",
    views: [
      { file: "hero", focus: "wide", mood: "dusk", note: "a luxury villa elevation at dusk" },
      { file: "gallery-01", focus: "elevation", mood: "dusk", note: "the villa elevation" },
      { file: "gallery-02", focus: "block", mood: "blue", note: "the apartment block" },
      { file: "gallery-03", focus: "pool", mood: "night", note: "the pool court" },
      { file: "gallery-04", focus: "approach", mood: "gold", note: "the landscaped approach" },
    ],
  },
  {
    slug: "garden-court", scene: "plots", accent: "sage", place: "project:garden-court", label: "Garden Court",
    views: [
      { file: "hero", focus: "wide", mood: "dusk", note: "a plotted development set into open land" },
      { file: "gallery-01", focus: "parcel", mood: "dusk", note: "the plotted layout" },
      { file: "gallery-02", focus: "road", mood: "blue", note: "the internal road network" },
      { file: "gallery-03", focus: "edge", mood: "dawn", note: "the landscape edge" },
      { file: "gallery-04", focus: "gate", mood: "night", note: "the entrance approach" },
    ],
  },
  {
    slug: "we-communities", scene: "eco", accent: "sage", place: "project:we-communities", label: "WE Communities",
    views: [
      { file: "hero", focus: "wide", mood: "dawn", note: "a low-rise community set into a green landscape" },
      { file: "gallery-01", focus: "cluster", mood: "dawn", note: "a villa cluster" },
      { file: "gallery-02", focus: "green", mood: "gold", note: "the shared green" },
      { file: "gallery-03", focus: "water", mood: "dusk", note: "the water court" },
      { file: "gallery-04", focus: "walk", mood: "blue", note: "the community walk" },
    ],
  },
  {
    slug: "eth-infra-haridwar-one", scene: "tower", accent: "gold", place: "project:haridwar-one",
    label: "ETH Infra — Haridwar One", sceneOpts: { river: true },
    views: [
      { file: "hero", focus: "wide", mood: "dusk", note: "an apartment tower against a river valley" },
      { file: "gallery-01", focus: "elevation", mood: "blue", note: "the tower elevation" },
      { file: "gallery-02", focus: "court", mood: "night", note: "the arrival court" },
      { file: "gallery-03", focus: "deck", mood: "dusk", note: "the amenity deck" },
      { file: "gallery-04", focus: "valley", mood: "dawn", note: "the river-facing aspect" },
    ],
  },
  {
    slug: "verdaant-court", scene: "plots", accent: "sage", place: "project:verdaant-court", label: "Verdaant Court",
    views: [
      { file: "hero", focus: "wide", mood: "blue", note: "a plotted development along a tree line" },
      { file: "gallery-01", focus: "parcel", mood: "blue", note: "the plotted layout" },
      { file: "gallery-02", focus: "road", mood: "dusk", note: "the boulevard" },
      { file: "gallery-03", focus: "edge", mood: "dawn", note: "the green buffer" },
      { file: "gallery-04", focus: "gate", mood: "night", note: "the gated entrance" },
    ],
  },
  {
    slug: "yugen", scene: "plots", accent: "gold", place: "project:yugen", label: "Yugen",
    views: [
      { file: "hero", focus: "wide", mood: "gold", note: "open land with a villa silhouette on the horizon" },
      { file: "gallery-01", focus: "parcel", mood: "gold", note: "the land parcel" },
      { file: "gallery-02", focus: "villa", mood: "dusk", note: "a villa elevation" },
      { file: "gallery-03", focus: "road", mood: "night", note: "the approach road" },
      { file: "gallery-04", focus: "horizon", mood: "dawn", note: "the horizon line" },
    ],
  },
];

const SIZES = {
  hero: [1920, 1080],
  gallery: [1600, 1100],
  category: [1200, 1500],
};

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

function write(file, svg, report) {
  const target = join(MEDIA, file);
  if (/NaN|Infinity|undefined/.test(svg)) {
    throw new Error(`${file}: emitted an invalid token`);
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, svg, "utf8");
  const bytes = statSync(target).size;
  if (bytes > MAX_BYTES) {
    throw new Error(`${file}: ${bytes} bytes exceeds the ${MAX_BYTES} byte budget`);
  }
  report.push({ path: relative(ROOT, target), bytes });
}

function main() {
  const report = [];

  for (const job of CATEGORY_JOBS) {
    const [w, h] = SIZES.category;
    write(
      job.file,
      compose({
        key: job.key, width: w, height: h, title: job.title, desc: job.desc,
        scene: job.scene, place: job.place, accent: job.accent, mood: job.mood,
        focus: job.focus, sceneOpts: job.sceneOpts ?? {},
      }),
      report,
    );
  }

  for (const project of PROJECT_JOBS) {
    for (const view of project.views) {
      const [w, h] = view.file === "hero" ? SIZES.hero : SIZES.gallery;
      write(
        `projects/${project.slug}/${view.file}.svg`,
        compose({
          key: `${project.slug}-${view.file}`,
          width: w, height: h,
          title: `${project.label} — abstract rendering of ${view.note}`,
          desc: `Generated stand-in artwork: abstract rendering of ${view.note}. Not a photograph of the property.`,
          scene: project.scene, place: project.place, accent: project.accent,
          mood: view.mood, focus: view.focus, sceneOpts: project.sceneOpts ?? {},
        }),
        report,
      );
    }
  }

  write("projects/garden-court/masterplan.svg", buildMasterplan(), report);

  const total = report.reduce((sum, r) => sum + r.bytes, 0);
  const largest = report.reduce((a, b) => (a.bytes > b.bytes ? a : b));
  for (const r of report) {
    process.stdout.write(`${r.path}  ${String(r.bytes).padStart(6)} B\n`);
  }
  process.stdout.write(
    `\n${report.length} files, ${(total / 1024).toFixed(1)} KB total, ` +
      `largest ${largest.path} at ${(largest.bytes / 1024).toFixed(1)} KB ` +
      `(budget ${MAX_BYTES / 1024} KB)\n`,
  );
}

main();
