// Static SVG renders of the procedural scene, shown before WebGL loads, without WebGL, or with reduced motion.
import * as THREE from 'three';
import { unlinkSync, writeFileSync } from 'node:fs';
import { buildSurfaces, sampleScene, scannerOrigin, type SceneVariant } from '../src/lib/spatialGeometry';

type Job = { file: string; variant: SceneVariant; colours: 'RGB' | 'Hero'; background: string; camera: [number, number, number]; target: [number, number, number]; fov: number; beams?: boolean };

const jobs: Job[] = [
  { file: 'interchange-light.svg', variant: 'corporate', colours: 'RGB', background: '#ece6da', camera: [27, 21, 29], target: [0, -.2, 0], fov: 32 },
  { file: 'interchange-dark.svg', variant: 'technology', colours: 'RGB', background: '#0f1216', camera: [28, 23, 28], target: [0, -.2, 0], fov: 32 },
  { file: 'interchange-hero.svg', variant: 'technology', colours: 'Hero', background: '#0c0e11', camera: [-26, 11, 26], target: [1, .6, -1], fov: 38, beams: true },
];

const W = 1600, H = 900;
for (const job of jobs) {
  const surfaces = buildSurfaces(job.variant), data = sampleScene(surfaces, 16000);
  const camera = new THREE.PerspectiveCamera(job.fov, W / H, .1, 260);
  camera.position.set(...job.camera);
  camera.lookAt(...job.target);
  camera.updateMatrixWorld();
  const dots: string[] = [];
  for (let i = 0; i < data.positions.length / 3; i++) {
    const p = new THREE.Vector3().fromArray(data.positions, i * 3).project(camera);
    if (p.z > 1 || Math.abs(p.x) > 1.05 || Math.abs(p.y) > 1.05) continue;
    const colour = new THREE.Color().fromArray(data[job.colours], i * 3);
    dots.push(`<circle cx="${((p.x + 1) * W / 2).toFixed(1)}" cy="${((1 - p.y) * H / 2).toFixed(1)}" r="1.4" fill="${colour.getStyle()}"/>`);
  }
  const beams: string[] = [];
  if (job.beams) {
    const origin = scannerOrigin.clone().setY(1.6).project(camera), ox = (origin.x + 1) * W / 2, oy = (1 - origin.y) * H / 2;
    for (let i = 0; i < 24; i++) {
      const angle = -.6 + i * .05, end = new THREE.Vector3(scannerOrigin.x + Math.cos(angle) * 30, -1 + (i % 6) * .8, scannerOrigin.z + Math.sin(angle) * 30).project(camera);
      beams.push(`<line x1="${ox.toFixed(1)}" y1="${oy.toFixed(1)}" x2="${((end.x + 1) * W / 2).toFixed(1)}" y2="${((1 - end.y) * H / 2).toFixed(1)}" stroke="#ff4a3a" stroke-opacity=".22" stroke-width="1"/>`);
    }
  }
  writeFileSync(`public/assets/${job.file}`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="${job.background}"/>${beams.join('')}${dots.join('')}</svg>`);
  surfaces.forEach(s => s.geometry.dispose());
  console.log(job.file, dots.length, 'points');
}

// Rasterise to WebP: a fraction of the SVG weight for the same look.
void (async () => {
  const sharp = (await import('sharp')).default;
  for (const job of jobs) {
    const svg = `public/assets/${job.file}`;
    await sharp(svg, { density: 96 }).webp({ quality: 82 }).toFile(svg.replace('.svg', '.webp'));
    // Phones get an 800 px copy through srcset.
    await sharp(svg, { density: 96 }).resize(800).webp({ quality: 82 }).toFile(svg.replace('.svg', '-800.webp'));
    // Phones crop the hero to a portrait strip; same centre crop as object-fit: cover.
    if (job.file === 'interchange-hero.svg') await sharp(svg.replace('.svg', '.webp')).extract({ left: 747, top: 0, width: 640, height: 1200 }).webp({ quality: 80 }).toFile('public/assets/interchange-hero-portrait.webp');
    unlinkSync(svg);
  }
})();
