// Gallery stills of the procedural scene from several stations and colour modes. Run: npx tsx scripts/generate-gallery.ts
import * as THREE from 'three';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { buildSurfaces, sampleScene } from '../src/lib/spatialGeometry';

type Colours = 'RGB' | 'Elevation' | 'Intensity' | 'Hero';
type Job = { file: string; colours: Colours; camera: [number, number, number]; target: [number, number, number]; fov: number; radius?: number; gain?: number };

const jobs: Job[] = [
  { file: 'overview-elevation', colours: 'Elevation', camera: [30, 26, 30], target: [0, -.5, 0], fov: 34 },
  { file: 'overpass-elevation', colours: 'Elevation', camera: [-18, 9, 16], target: [2, 2, -1], fov: 40 },
  { file: 'plan-intensity', colours: 'Intensity', camera: [0, 58, .01], target: [0, 0, 0], fov: 38, radius: 1.1 },
  { file: 'corridor-hero', colours: 'Hero', camera: [-26, 14, 26], target: [1, .6, -1], fov: 38 },
  { file: 'oblique-rgb', colours: 'RGB', camera: [26, 20, -26], target: [0, 0, 0], fov: 36, gain: 1.7 },
  { file: 'plan-elevation', colours: 'Elevation', camera: [.01, 60, 0], target: [0, 0, 0], fov: 38, radius: 1.1 },
];

const W = 1500, H = 1000, out = 'public/assets/scene';
mkdirSync(out, { recursive: true });
const surfaces = buildSurfaces('technology'), data = sampleScene(surfaces, 60000);
for (const job of jobs) {
  const camera = new THREE.PerspectiveCamera(job.fov, W / H, .1, 260);
  camera.position.set(...job.camera);
  camera.lookAt(...job.target);
  camera.updateMatrixWorld();
  const dots: { z: number; svg: string }[] = [];
  for (let i = 0; i < data.positions.length / 3; i++) {
    const world = new THREE.Vector3().fromArray(data.positions, i * 3), p = world.clone().project(camera);
    if (p.z > 1 || p.z < -1 || Math.abs(p.x) > 1.05 || Math.abs(p.y) > 1.05) continue;
    // Nearer points are drawn larger and later, which keeps close-ups solid.
    const distance = world.distanceTo(camera.position), r = Math.min(3.2, (job.radius ?? 1.25) * 34 / Math.max(distance, 8));
    const colour = new THREE.Color().fromArray(data[job.colours], i * 3).multiplyScalar(job.gain ?? 1);
    dots.push({ z: distance, svg: `<circle cx="${((p.x + 1) * W / 2).toFixed(1)}" cy="${((1 - p.y) * H / 2).toFixed(1)}" r="${r.toFixed(2)}" fill="${colour.getStyle()}"/>` });
  }
  dots.sort((a, b) => b.z - a.z);
  writeFileSync(`${out}/${job.file}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0b0d10"/>${dots.map(d => d.svg).join('')}</svg>`);
  console.log(job.file, dots.length, 'points');
}
surfaces.forEach(s => s.geometry.dispose());

void (async () => {
  const sharp = (await import('sharp')).default;
  for (const job of jobs) {
    const svg = `${out}/${job.file}.svg`;
    await sharp(svg, { density: 96 }).webp({ quality: 72 }).toFile(svg.replace('.svg', '.webp'));
    // Phones get an 800 px copy through srcset.
    await sharp(svg, { density: 96 }).resize(800).webp({ quality: 72 }).toFile(svg.replace('.svg', '-800.webp'));
    unlinkSync(svg);
  }
})();
