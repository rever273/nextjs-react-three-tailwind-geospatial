import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type DisplayMode = 'RGB' | 'Elevation' | 'Intensity';
export type SceneVariant = 'corporate' | 'technology';
export type SurfaceKind = 'terrain' | 'road' | 'concrete' | 'marking' | 'vegetation' | 'building' | 'detail';
export type Surface = { geometry: THREE.BufferGeometry; colour: string; kind: SurfaceKind };
type Point = [number, number, number];

export const scenePointBudget = (variant: SceneVariant, mobile: boolean) => mobile ? (variant === 'corporate' ? 22000 : 14000) : (variant === 'corporate' ? 90000 : 56000);

export function terrainHeight(x: number, z: number) {
  return -.85 + .2 * Math.sin(x * .19) * Math.cos(z * .22) + .1 * Math.sin(z * .4) + .05 * Math.sin(x * .7 + z * .3);
}

const palette = {
  corporate: { terrain: '#a9ad87', base: '#d8d1c3', asphalt: '#43474d', deck: '#565b62', concrete: '#cfcac0', fascia: '#bdb7ab', marking: '#f2efe4', canopy: ['#7c8a5c', '#66764d', '#8e9a6a'], trunk: '#8a7a62' },
  // Saturated surface colours so RGB reads clearly differently from intensity on a dark background.
  technology: { terrain: '#8aa04a', base: '#b49a6a', asphalt: '#5a6270', deck: '#7d8794', concrete: '#e4dccb', fascia: '#c9bfa8', marking: '#fff6c9', canopy: ['#4f9a3f', '#6fb34a', '#3f7f35'], trunk: '#8a6a44' },
};

function surface(n: number, m: number, fn: (u: number, v: number) => Point, colour: string, kind: SurfaceKind): Surface {
  const vertices: number[] = [], indices: number[] = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) vertices.push(...fn(i / n, j / m));
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const a = i * (m + 1) + j, b = a + m + 1; indices.push(a, a + 1, b, b, a + 1, b + 1); }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return { geometry, colour, kind };
}

function offset(path: (t: number) => Point, t: number, distance: number, lift = 0): Point {
  const p = path(t), a = path(Math.max(0, t - .001)), b = path(Math.min(1, t + .001));
  const dx = b[0] - a[0], dz = b[2] - a[2], length = Math.hypot(dx, dz) || 1;
  return [p[0] - dz / length * distance, p[1] + lift, p[2] + dx / length * distance];
}

/** A generic, intentionally simplified interchange: carriageways, an overpass, a ramp and context. */
export function buildSurfaces(variant: SceneVariant = 'corporate'): Surface[] {
  const colours = palette[variant];
  const parts: Surface[] = [];
  const addBox = (x: number, y: number, z: number, w: number, h: number, d: number, colour: string, kind: SurfaceKind = 'concrete', rotation = 0) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    if (rotation) geometry.rotateY(rotation);
    geometry.translate(x, y + h / 2, z);
    parts.push({ geometry, colour, kind });
  };

  parts.push(surface(110, 84, (u, v) => { const x = (u - .5) * 50, z = (v - .5) * 38; return [x, terrainHeight(x, z), z]; }, colours.terrain, 'terrain'));
  addBox(0, -2.3, 0, 50, 1.3, 38, colours.base, 'terrain');

  const road = (path: (t: number) => Point, width: number, elevated = false, lanes = 1) => {
    parts.push(surface(160, 8, (u, v) => offset(path, u, (v - .5) * width), elevated ? colours.deck : colours.asphalt, 'road'));
    for (const side of [-1, 1]) {
      parts.push(surface(160, 1, (u, v) => offset(path, u, side * (width / 2 - .2) + (v - .5) * .08, .025), colours.marking, 'marking'));
      parts.push(surface(160, 1, (u, v) => offset(path, u, side * width / 2, -.3 * v), colours.fascia, 'concrete'));
      if (elevated) {
        // Parapet: inner face, top and a deeper fascia band.
        parts.push(surface(160, 1, (u, v) => offset(path, u, side * (width / 2 + .05), -.06 + v * .36), colours.concrete, 'concrete'));
        parts.push(surface(160, 1, (u, v) => offset(path, u, side * (width / 2 + .05) + (v - .5) * .16, .3), colours.concrete, 'concrete'));
        parts.push(surface(160, 1, (u, v) => offset(path, u, side * (width / 2 + .13), -.75 + v * .45), colours.fascia, 'concrete'));
      } else {
        parts.push(surface(160, 2, (u, v) => offset(path, u, side * (width / 2 + .3) + (v - .5) * .42, -.01), colours.base, 'concrete'));
      }
    }
    if (elevated) parts.push(surface(160, 4, (u, v) => offset(path, u, (v - .5) * width * .9, -.78), colours.fascia, 'concrete'));
    // Lane lines: dashed between lanes, plus a centre dash.
    for (let lane = 1; lane < lanes + 1; lane++) {
      const across = -width / 2 + (width / (lanes + 1)) * lane;
      for (let k = 0; k < 26; k++) parts.push(surface(2, 1, (u, v) => offset(path, (k + u * .5) / 26, across + (v - .5) * .07, .03), colours.marking, 'marking'));
    }
    return path;
  };

  // Divided motorway: two carriageways with a median barrier.
  for (const side of [-1, 1]) road(t => { const x = (t - .5) * 50, z = Math.sin(x * .065) * 1.4 + side * 2.35; return [x, terrainHeight(x, z) + .15, z]; }, 3.6, false, 2);
  parts.push(surface(160, 1, (u, v) => { const x = (u - .5) * 50, z = Math.sin(x * .065) * 1.4; return [x, terrainHeight(x, z) + .15 + v * .45, z]; }, colours.concrete, 'concrete'));

  const bridge = (t: number): Point => { const z = (t - .5) * 38, x = Math.sin(z * .074) * 3.7; return [x, terrainHeight(x, z) + .18 + 4.1 * Math.exp(-Math.pow(z / 12.5, 4)), z]; };
  road(bridge, 4.9, true, 1);

  const start = new THREE.Vector3(21, terrainHeight(21, 4.5) + .16, 4.5);
  const end = new THREE.Vector3(...bridge(.72));
  const curve = new THREE.CubicBezierCurve3(start, new THREE.Vector3(9, .1, 14), new THREE.Vector3(1, 2.2, 15), end);
  road(t => { const p = curve.getPoint(t); return [p.x, p.y, p.z]; }, 2.6, true, 0);

  // Piers with headstocks under the overpass.
  for (const t of [.22, .34, .5, .66, .78]) {
    const [x, y, z] = bridge(t), base = terrainHeight(x, z);
    for (const side of [-1, 1]) {
      const geometry = new THREE.CylinderGeometry(.26, .34, Math.max(.4, y - base - .8), 14);
      geometry.translate(x + side * 1.45, (y + base - .8) / 2, z);
      parts.push({ geometry, colour: colours.concrete, kind: 'concrete' });
    }
    addBox(x, y - 1.15, z, 4.9, .38, .8, colours.concrete);
  }
  for (const t of [.28, .52, .75]) {
    const p = curve.getPoint(t), base = terrainHeight(p.x, p.z);
    if (p.y > base + .9) addBox(p.x, base, p.z, .5, p.y - base - .75, .6, colours.concrete);
  }

  // Overhead sign gantry across the motorway.
  for (const gx of [-12.5, 13]) {
    const z0 = Math.sin(gx * .065) * 1.4;
    for (const side of [-1, 1]) addBox(gx, terrainHeight(gx, z0 + side * 4.9), z0 + side * 4.9, .18, 3.1, .18, '#8a949b', 'detail');
    addBox(gx, terrainHeight(gx, z0) + 2.95, z0, .22, .22, 10, '#8a949b', 'detail');
    for (const side of [-1, 1]) addBox(gx + .05, terrainHeight(gx, z0) + 2.25, z0 + side * 2.35, .08, .75, 2.4, variant === 'corporate' ? '#2f6b4f' : '#3b7a5a', 'detail');
  }

  // Street lighting along both verges.
  for (const x of [-20, -9, 2, 16]) {
    for (const side of [-1, 1]) {
      const z = Math.sin(x * .065) * 1.4 + side * 5.1, y = terrainHeight(x, z);
      addBox(x, y, z, .08, 3, .08, '#7d878e', 'detail');
      addBox(x, y + 2.95, z - side * .35, .12, .07, .8, '#d6dbdb', 'detail');
    }
  }

  if (variant === 'technology') {
    for (const [x, z, w, h, d] of [[-15, -12, 8, 4.6, 6], [-16, 11, 7, 3.4, 5], [14, -12, 8, 5.8, 6], [19.5, 11, 6, 3, 4]]) {
      const y = terrainHeight(x, z);
      addBox(x, y, z, w, h, d, variant === 'technology' ? ['#c56a4b', '#7fa7c9', '#d8c49a', '#9aa7b5'][Math.abs(Math.round(x + z)) % 4] : '#aebec4', 'building');
      addBox(x, y + h, z, w + .25, .14, d + .25, '#d2d8d5', 'building');
      for (let level = 0; level < Math.floor(h / 1.3); level++) for (let k = -1; k <= 1; k++) addBox(x + k * w / 4, y + .9 + level * 1.25, z - d / 2 - .035, w / 7, .5, .06, '#5fc4ff', 'detail');
    }
  }

  // Eucalypt-like planting: trunk with two or three clustered crowns.
  let seed = variant === 'corporate' ? 311 : 711;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let k = 0; k < 90; k++) {
    const x = (rand() - .5) * 47, z = (rand() - .5) * 35;
    if (Math.abs(z - Math.sin(x * .065) * 1.4) < 6.4 || Math.abs(x - Math.sin(z * .074) * 3.7) < 4.2) continue;
    if (variant === 'technology' && Math.abs(x) > 9 && Math.abs(z) > 7.5 && Math.abs(z) < 15) continue;
    if (x > 2 && x < 22 && z > 3 && z < 16) continue;
    const y = terrainHeight(x, z), h = 1.6 + rand() * 2.2;
    const trunk = new THREE.CylinderGeometry(.07, .13, h, 6);
    trunk.translate(x, y + h / 2, z);
    parts.push({ geometry: trunk, colour: colours.trunk, kind: 'vegetation' });
    const crowns = 2 + Math.floor(rand() * 2);
    for (let c = 0; c < crowns; c++) {
      const r = .55 + rand() * .45, crown = new THREE.IcosahedronGeometry(r, 1);
      crown.scale(1.15, .8, 1.15);
      crown.translate(x + (rand() - .5) * .9, y + h - .2 + c * .35, z + (rand() - .5) * .9);
      parts.push({ geometry: crown, colour: colours.canopy[(k + c) % 3], kind: 'vegetation' });
    }
  }

  // Generic traffic on the carriageways.
  const cars: [number, number, string][] = [[-17, -1, '#e5e9e8'], [-6, -3.1, '#2f6fd1'], [6, 1.6, '#e08a2e'], [15, 3.2, '#e5e9e8'], [-11, 3, '#f2c230'], [19, -1.6, '#d23b30']];
  for (const [x, lane, colour] of cars) {
    const z = Math.sin(x * .065) * 1.4 + lane, y = terrainHeight(x, z) + .17;
    addBox(x, y, z, 1.7, .42, .78, colour, 'detail');
    addBox(x + .08, y + .42, z, .9, .3, .68, '#33424c', 'detail');
  }

  const groups = new Map<string, Surface[]>();
  for (const part of parts) { const key = part.kind + part.colour; if (!groups.has(key)) groups.set(key, []); groups.get(key)!.push(part); }
  return [...groups.values()].map(group => {
    // Keep positions only: boxes carry UVs and ribbons do not, and normals are recomputed after merging.
    const geometries = group.map(s => { const g = s.geometry.index ? s.geometry.toNonIndexed() : s.geometry.clone(); for (const name of Object.keys(g.attributes)) if (name !== 'position') g.deleteAttribute(name); return g; });
    const geometry = mergeGeometries(geometries, false)!;
    geometry.computeVertexNormals();
    geometries.forEach(g => g.dispose());
    group.forEach(s => s.geometry.dispose());
    return { geometry, colour: group[0].colour, kind: group[0].kind };
  });
}

/** Where the laser scanner stands in the Technology hero scene. */
export const scannerOrigin = new THREE.Vector3(-6, 0, 9);

/**
 * Deterministically samples the surfaces into a point cloud.
 * `order: 'azimuth'` sorts points by angle around the scanner so a growing draw range reads as a laser sweep.
 */
export function sampleScene(surfaces: Surface[], count: number, order: 'x' | 'azimuth' = 'x') {
  let seed = 73191;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const weights: Record<SurfaceKind, number> = { terrain: .4, road: 2.2, concrete: 2.6, marking: 7, vegetation: 1.2, building: 1.3, detail: 4.5 };
  const triangles: { surface: Surface; offset: number; cumulative: number }[] = [];
  let total = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (const item of surfaces) {
    const position = item.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i += 3) {
      a.fromBufferAttribute(position, i); b.fromBufferAttribute(position, i + 1); c.fromBufferAttribute(position, i + 2);
      const area = b.sub(a).cross(c.sub(a)).length() * .5;
      total += area * weights[item.kind];
      triangles.push({ surface: item, offset: i, cumulative: total });
    }
  }
  const red = new THREE.Color('#e23b2e'), white = new THREE.Color('#f4f1ea');
  const samples: { p: number[]; c: THREE.Color; hero: THREE.Color; intensity: number; key: number }[] = [];
  for (let k = 0; k < count; k++) {
    const target = random() * total;
    let lo = 0, hi = triangles.length - 1;
    while (lo < hi) { const middle = (lo + hi) >>> 1; if (triangles[middle].cumulative < target) lo = middle + 1; else hi = middle; }
    const tri = triangles[lo], pos = tri.surface.geometry.getAttribute('position'), r = Math.sqrt(random()), q = random(), u = 1 - r, v = r * (1 - q), w = r * q;
    // Small positional jitter so the cloud reads as captured data, not a perfect grid.
    const p = [0, 1, 2].map(axis => u * pos.array[tri.offset * 3 + axis] + v * pos.array[(tri.offset + 1) * 3 + axis] + w * pos.array[(tri.offset + 2) * 3 + axis] + (random() - .5) * .03);
    const colour = new THREE.Color(tri.surface.colour).multiplyScalar(.85 + random() * .35);
    const kind = tri.surface.kind;
    const intensity = kind === 'marking' ? .95 : kind === 'concrete' ? .62 + random() * .3 : kind === 'road' ? .28 + random() * .22 : kind === 'vegetation' ? .2 + random() * .35 : .35 + random() * .5;
    const grey = .18 + intensity * .72;
    const hero = kind === 'marking' ? white.clone() : kind === 'detail' && random() > .5 ? red.clone().multiplyScalar(.85 + random() * .3) : new THREE.Color(grey, grey * .98, grey * .96);
    const key = order === 'azimuth' ? Math.atan2(p[2] - scannerOrigin.z, p[0] - scannerOrigin.x) : p[0];
    samples.push({ p, c: colour, hero, intensity, key });
  }
  samples.sort((s1, s2) => s1.key - s2.key);
  const positions = new Float32Array(count * 3), rgb = new Float32Array(count * 3), elevation = new Float32Array(count * 3), intensity = new Float32Array(count * 3), heroColours = new Float32Array(count * 3);
  const ramp = [new THREE.Color('#2b4cff'), new THREE.Color('#19c3e6'), new THREE.Color('#9be15d'), new THREE.Color('#ffd23f'), new THREE.Color('#ff5a36')];
  const tmp = new THREE.Color();
  samples.forEach((s, i) => {
    positions.set(s.p, i * 3);
    rgb.set([s.c.r, s.c.g, s.c.b], i * 3);
    // Classic LiDAR elevation ramp: blue → cyan → green → yellow → red.
    const t = THREE.MathUtils.clamp((s.p[1] + 1.2) / 5.6, 0, 1) * (ramp.length - 1), k = Math.min(ramp.length - 2, Math.floor(t));
    tmp.copy(ramp[k]).lerp(ramp[k + 1], t - k);
    elevation.set([tmp.r, tmp.g, tmp.b], i * 3);
    const g = .12 + s.intensity * .85;
    intensity.set([g, g, g], i * 3);
    heroColours.set([s.hero.r, s.hero.g, s.hero.b], i * 3);
  });
  return { positions, RGB: rgb, Elevation: elevation, Intensity: intensity, Hero: heroColours, keys: samples.map(s => s.key) };
}
