'use client';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { useReducedMotionPreference } from '@/lib/useScrolled';
import { ArrowLeft, ArrowRight, Box, Expand, MoveHorizontal, Phone, Quote, Star } from 'lucide-react';
import { company, copy } from '@/content/company';
import { compareMedia, galleryMedia, initials, testimonials } from '@/content/showcase';
import type { DisplayMode } from '@/lib/spatialGeometry';
import { HeroPointCloud } from '@/components/three/SceneViewer';
import { Media } from '@/components/ui/Media';
import { useLightbox } from '@/components/ui/Lightbox';

/**
 * Twinkling survey-point constellation behind dark sections. One fixed 2D canvas,
 * ~30 fps, paused when hidden; static with reduced motion.
 */
export function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, frame = 0, last = 0, mouseX = -999, mouseY = -999;
    let seed = 2026;
    const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    type Dot = { x: number; y: number; vx: number; vy: number; r: number; phase: number; speed: number; red: boolean };
    let dots: Dot[] = [];
    let bursts: { x: number; y: number; born: number; pts: [number, number][] }[] = [];
    const build = () => {
      const count = w < 768 ? 50 : w < 1200 ? 100 : 150;
      dots = Array.from({ length: count }, () => ({ x: rand() * w, y: rand() * h, vx: (rand() - .5) * .45, vy: (rand() - .5) * .45, r: .8 + rand() * 1.4, phase: rand() * Math.PI * 2, speed: .6 + rand() * 1.2, red: rand() < .08 }));
    };
    const draw = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        if (!reduced) { d.x += d.vx; d.y += d.vy; if (d.x < -20) d.x = w + 20; if (d.x > w + 20) d.x = -20; if (d.y < -20) d.y = h + 20; if (d.y > h + 20) d.y = -20; }
        const dx = d.x - mouseX, dy = d.y - mouseY, dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0) { d.x += dx / dist * .6; d.y += dy / dist * .6; }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i], ay = a.y;
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j], by = b.y, dist = Math.hypot(a.x - b.x, ay - by);
          if (dist < 130) { ctx.strokeStyle = `rgba(255,255,255,${.12 * (1 - dist / 130)})`; ctx.beginPath(); ctx.moveTo(a.x, ay); ctx.lineTo(b.x, by); ctx.stroke(); }
        }
      }
      for (const d of dots) {
        const y = d.y, alpha = .35 + .55 * (Math.sin(t * d.speed + d.phase) + 1) / 2;
        ctx.fillStyle = d.red ? `rgba(226,59,46,${alpha})` : `rgba(236,237,239,${alpha})`;
        ctx.beginPath(); ctx.arc(d.x, y, d.r, 0, Math.PI * 2); ctx.fill();
      }
      // Occasional local "scan" bursts that appear and fade.
      if (!reduced && (bursts.length < 2 && rand() < .01)) {
        const bx = rand() * w, by = rand() * h;
        bursts.push({ x: bx, y: by, born: t, pts: Array.from({ length: 9 }, () => [bx + (rand() - .5) * 90, by + (rand() - .5) * 60]) });
      }
      bursts = bursts.filter(b => t - b.born < 3.5);
      for (const b of bursts) {
        const life = (t - b.born) / 3.5, alpha = Math.sin(life * Math.PI) * .8;
        ctx.strokeStyle = `rgba(226,59,46,${alpha * .35})`;
        ctx.beginPath(); b.pts.forEach(([x, y], i) => { const [nx, ny] = b.pts[(i + 1) % b.pts.length]; ctx.moveTo(x, y); ctx.lineTo(nx, ny); }); ctx.stroke();
        ctx.fillStyle = `rgba(255,120,100,${alpha})`;
        for (const [x, y] of b.pts) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
      }
    };
    const loop = (now: number) => {
      if (!document.hidden && now - last > 32) { last = now; draw(now); }
      frame = requestAnimationFrame(loop);
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(); draw(performance.now());
    };
    const move = (event: globalThis.PointerEvent) => { mouseX = event.clientX; mouseY = event.clientY; };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    if (!reduced) frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', move); };
  }, []);
  return <canvas ref={ref} className="t-constellation" aria-hidden="true" />;
}

type Box = { x: number; y: number; w: number; h: number };
type GeoLayout = {
  width: number; height: number;
  stations: { x: number; y: number; id: string; rl: string; label: boolean }[];
  legs: { id: string; x1: number; y1: number; x2: number; y2: number; label: { x: number; y: number; d: string } | null }[];
  patches: { x: number; y: number; points: { x: number; y: number; red: boolean }[] }[];
};

// Everything a visitor reads or touches; decorations keep clear of these.
const contentSelector = 'h1, h2, h3, p, li, a, button, img, video, canvas, form, blockquote, address, .media, .t-plate, .t-card, .t-pipe-icon';
const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const PATCH = { w: 150, h: 70 }, STATION = { w: 104, h: 34 }, MARKER = { w: 24, h: 24 }, DISTANCE = { w: 72, h: 18 };

/**
 * Survey linework over the millimetre grid on light sections: control stations joined by a
 * dashed traverse with measured distances, and faint scan patches of points on contour lines.
 * Placed after layout, only in space that no text, media or control occupies; seeded, so the
 * same section always gets the same arrangement at a given size.
 */
export function DotClouds({ seed = 1 }: { seed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<GeoLayout | null>(null);
  useEffect(() => {
    const root = ref.current, section = root?.parentElement;
    if (!root || !section) return;
    let frame = 0;
    const place = () => {
      const origin = section.getBoundingClientRect(), width = section.clientWidth, height = section.clientHeight;
      const margin = 28;
      const taken: Box[] = [...section.querySelectorAll<HTMLElement>(contentSelector)]
        .filter(element => !root.contains(element) && element.offsetParent !== null)
        .map(element => { const r = element.getBoundingClientRect(); return { x: r.left - origin.left - margin, y: r.top - origin.top - margin, w: r.width + margin * 2, h: r.height + margin * 2 }; });
      let s = seed * 9301 + 49297;
      const rand = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
      // Up to 160 random tries for a free box within a horizontal band of the section.
      const find = (size: { w: number; h: number }, band: [number, number]) => {
        for (let attempt = 0; attempt < 160; attempt++) {
          const box = { x: width * (band[0] + rand() * (band[1] - band[0])), y: 24 + rand() * Math.max(0, height - size.h - 48), ...size };
          if (box.x + box.w > width - 8) continue;
          if (!taken.some(other => overlaps(box, other))) { taken.push(box); return box; }
        }
        return null;
      };
      const small = width < 768;
      const stations = ([[0, .3], [.35, .62], [.68, .92]] as [number, number][]).flatMap((band, i) => {
        const box = find(small ? MARKER : STATION, band) ?? find(MARKER, band);
        return box ? [{ x: box.x + 12, y: box.y + 12, id: `CP${100 + seed * 7 + i}`, rl: (8 + rand() * 30).toFixed(3), label: box.w > MARKER.w }] : [];
      });
      const legs = stations.slice(1).map((b, i) => {
        const a = stations[i], mid = { x: (a.x + b.x) / 2 - DISTANCE.w / 2, y: (a.y + b.y) / 2 - DISTANCE.h / 2, ...DISTANCE };
        const free = !small && !taken.some(other => overlaps(mid, other));
        if (free) taken.push(mid);
        return { id: a.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y, label: free ? { x: mid.x, y: mid.y, d: (Math.hypot(b.x - a.x, b.y - a.y) / 9).toFixed(3) } : null };
      });
      const patches = (small ? [[0, 1]] : [[0, .5], [.5, 1]] as [number, number][]).flatMap(band => {
        const box = find(PATCH, band as [number, number]);
        if (!box) return [];
        const phase = rand() * 6, points: { x: number; y: number; red: boolean }[] = [];
        for (let line = 0; line < 3; line++) for (let x = 6; x < PATCH.w - 6; x += 7 + rand() * 9) {
          points.push({ x: Math.round(x), y: Math.round(14 + line * 20 + Math.sin(x / 24 + phase + line * .5) * 7 + (rand() - .5) * 3), red: rand() < .05 });
        }
        return [{ x: box.x, y: box.y, points }];
      });
      setLayout({ width, height, stations, legs, patches });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); };
    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [seed]);
  return (
    <div className="t-dotclouds" ref={ref} aria-hidden="true">
      {layout && (
        <>
          <svg className="t-geo-lines" viewBox={`0 0 ${layout.width} ${layout.height}`}>
            {layout.legs.map(leg => <line key={leg.id} x1={leg.x1} y1={leg.y1} x2={leg.x2} y2={leg.y2} />)}
          </svg>
          {layout.legs.map(leg => leg.label && <span key={leg.id} className="t-geo-distance" style={{ left: leg.label.x, top: leg.label.y }}>{leg.label.d} m</span>)}
          {layout.stations.map(station => (
            <span key={station.id} className="t-geo-station" style={{ left: station.x, top: station.y }}>
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3 21 19H3Z" /><circle cx="12" cy="13.5" r="1.8" /></svg>
              {station.label && <em>{station.id}<br />RL {station.rl}</em>}
            </span>
          ))}
          {layout.patches.map((patch, index) => (
            <svg key={index} className="t-geo-patch" viewBox={`0 0 ${PATCH.w} ${PATCH.h}`} width={PATCH.w} height={PATCH.h} style={{ left: patch.x, top: patch.y }}>
              {patch.points.map((point, k) => <circle key={k} cx={point.x} cy={point.y} r={point.red ? 1.4 : 1} className={point.red ? 'is-red' : undefined} />)}
            </svg>
          ))}
        </>
      )}
    </div>
  );
}

/** Vertical red laser that draws itself with scroll progress. */
export function LaserLine() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const top = useTransform(progress, value => `${value * 100}%`);
  return (
    <div className="t-laser" aria-hidden="true">
      <motion.div className="t-laser-beam" style={{ scaleY: progress }} />
      <motion.span className="t-laser-tip" style={{ top }} />
    </div>
  );
}

/** Horizontal laser separator between sections, with decorative coordinates. */
export function LaserBridge({ coords = 'X: 27.4698 | Y: 153.0251', index = '01 / 08' }: { coords?: string; index?: string }) {
  return (
    <div className="t-bridge" aria-hidden="true">
      <span className="t-bridge-line" />
      <span className="t-bridge-dot" />
      <span className="t-bridge-meta"><span>{coords}</span><span><i />SCAN {index}</span></span>
    </div>
  );
}

const modes: (DisplayMode | 'Hero')[] = ['Hero', 'RGB', 'Elevation'];
const modeLabel: Record<string, string> = { Hero: 'INT', RGB: 'RGB', Elevation: 'ELEV' };

/** Hero: live laser-scan cloud, copy, a cursor-following target and a few HUD details. */
export function TechHero() {
  const [mode, setMode] = useState<DisplayMode | 'Hero'>('Hero');
  const reduced = useReducedMotionPreference();
  const target = useRef<HTMLSpanElement>(null);
  const [coord, setCoord] = useState({ x: .5, y: .5 });
  const [tracking, setTracking] = useState(false);
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== 'mouse' || !target.current) return;
    const r = event.currentTarget.getBoundingClientRect();
    target.current.style.transform = `translate(${event.clientX - r.left}px, ${event.clientY - r.top}px)`;
    setCoord({ x: (event.clientX - r.left) / r.width, y: (event.clientY - r.top) / r.height });
    if (!tracking) setTracking(true);
  };
  return (
    <section className="t-hero" onPointerMove={move}>
      <HeroPointCloud mode={mode} />
      <div className="t-hero-shade" aria-hidden="true" />
      <span className="t-visor t-visor-tl" aria-hidden="true" /><span className="t-visor t-visor-br" aria-hidden="true" />
      <span className={`t-target ${tracking ? 'is-on' : ''}`} ref={target} aria-hidden="true"><i /><em>{(27.4598 + coord.y * .02).toFixed(4)}° S · {(153.0151 + coord.x * .02).toFixed(4)}° E</em></span>
      <div className="t-hero-copy">
        <p className="t-eyebrow"><span />Survey · Mobile LiDAR · Digital engineering</p>
        <h1>See the<br />real world.<br /><em>Measured<br />in detail.</em></h1>
        <p className="t-hero-lead">{company.introduction} {copy.heroLead}</p>
        <div className="t-hero-actions">
          <a className="t-button t-button-red" href="#explore">Explore Our Technology<ArrowRight size={20} /></a>
          <a className="t-button t-button-outline" href={`tel:${company.tel}`}><Phone size={18} />{company.phone}</a>
        </div>
      </div>
      <div className="t-hud" aria-label="Point cloud colour mode">
        <span className="t-hud-label">Point cloud</span>
        <div className="t-hud-modes" role="group" aria-label="Colour mode">
          {modes.map(item => <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)}>{modeLabel[item]}</button>)}
        </div>
      </div>
      <p className="t-hero-coords" aria-hidden="true">27.4698° S · 153.0251° E · BRISBANE · QLD</p>
    </section>
  );
}

// Vertical crop of the comparison photo; must match its object-position below.
const compareCropY = .4;

/** Photograph vs. sampled point view, revealed with a full-height laser handle. */
export function PhotoToPoints() {
  const [position, setPosition] = useState(50);
  const [ready, setReady] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null), stage = useRef<HTMLDivElement>(null), dragging = useRef(false);
  const reduced = useReducedMotionPreference();
  // Resampling is ~200 ms of main-thread work, so it waits until the comparison is close to the viewport.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const image = new Image();
    let alive = true;
    image.onload = () => {
      const target = canvas.current, ctx = target?.getContext('2d');
      if (!alive || !target || !ctx) return;
      const W = 1200, H = 530;
      target.width = W; target.height = H;
      // Same crop as the photo's object-fit: cover and object-position in the frame below.
      const sh = image.width * H / W;
      ctx.drawImage(image, 0, (image.height - sh) * compareCropY, image.width, sh, 0, 0, W, H);
      const pixels = ctx.getImageData(0, 0, W, H).data;
      // Luminance, then a box blur through an integral image: colours follow surfaces, not texture noise.
      const lum = new Float32Array(W * H), sum = new Float64Array((W + 1) * (H + 1));
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        lum[y * W + x] = (pixels[i] * .3 + pixels[i + 1] * .59 + pixels[i + 2] * .11) / 255;
        sum[(y + 1) * (W + 1) + x + 1] = lum[y * W + x] + sum[y * (W + 1) + x + 1] + sum[(y + 1) * (W + 1) + x] - sum[y * (W + 1) + x];
      }
      const box = (x: number, y: number, r: number) => {
        const x0 = Math.max(0, x - r), y0 = Math.max(0, y - r), x1 = Math.min(W, x + r + 1), y1 = Math.min(H, y + r + 1);
        return (sum[y1 * (W + 1) + x1] - sum[y0 * (W + 1) + x1] - sum[y1 * (W + 1) + x0] + sum[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
      };
      ctx.fillStyle = '#07090c'; ctx.fillRect(0, 0, W, H);
      const ramp = [[30, 60, 170], [30, 150, 215], [90, 205, 140], [240, 215, 70], [235, 90, 55]];
      let seed = 7;
      const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      for (let y = 2; y < H - 2; y += 3) for (let x = 2; x < W - 2; x += 3) {
        const i = (y * W + x) * 4, smooth = box(x, y, 4);
        const edge = Math.min(1, (Math.abs(box(x + 2, y, 1) - box(x - 2, y, 1)) + Math.abs(box(x, y + 2, 1) - box(x, y - 2, 1))) * 4);
        // A scanner gets no return from the sky: bright, bluish areas in the upper part stay empty.
        const sky = y < H * .62 && smooth > .58 && pixels[i + 2] >= pixels[i] - 6 && edge < .35;
        if (sky) continue;
        // Density falls off with range (top of frame) and rises on edges, as in a real scan.
        if (rand() > .16 + .3 * (y / H) + edge * .7) continue;
        const v = Math.min(.999, Math.max(0, (smooth - .12) / .7)) * (ramp.length - 1), k = Math.floor(v), f = v - k;
        const c = ramp[k].map((channel, n) => Math.round(channel + (ramp[k + 1][n] - channel) * f));
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${.55 + edge * .45})`;
        const size = 1 + (y / H) * .8;
        ctx.fillRect(x + (rand() - .5) * 2, y + (rand() - .5) * 2, size, size);
      }
      setReady(true);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      image.src = compareMedia.src;
    }, { rootMargin: '600px 0px' });
    observer.observe(element);
    return () => { alive = false; observer.disconnect(); };
  }, []);
  // A short demonstration sweep the first time it becomes visible.
  useEffect(() => {
    if (!ready || reduced || !stage.current) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now(), keys = [50, 22, 78, 50];
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 2600), seg = Math.min(2, Math.floor(t * 3)), local = t * 3 - seg, e = local < .5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
        if (!dragging.current) setPosition(keys[seg] + (keys[seg + 1] - keys[seg]) * e);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .6 });
    observer.observe(stage.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [ready, reduced]);
  const setFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const r = stage.current!.getBoundingClientRect();
    setPosition(Math.max(0, Math.min(100, ((event.clientX - r.left) / r.width) * 100)));
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); setPosition(p => Math.max(0, p - 5)); }
    if (event.key === 'ArrowRight') { event.preventDefault(); setPosition(p => Math.min(100, p + 5)); }
    // Home/End would otherwise also scroll the whole page.
    if (event.key === 'Home') { event.preventDefault(); setPosition(0); }
    if (event.key === 'End') { event.preventDefault(); setPosition(100); }
  };
  return (
    <figure className="t-compare">
      <div
        className="t-compare-stage"
        ref={stage}
        onPointerDown={event => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); setFromPointer(event); }}
        onPointerMove={event => { if (dragging.current) setFromPointer(event); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
      >
        <Media src={compareMedia.src} srcSmall={compareMedia.small} sizes="(max-width: 1100px) 100vw, 60vw" alt={compareMedia.alt} width={compareMedia.width} height={compareMedia.height} ratio="1200 / 530" position={`50% ${compareCropY * 100}%`} />
        <canvas ref={canvas} style={{ clipPath: `inset(0 0 0 ${position}%)` }} aria-hidden="true" />
        <span className="t-compare-label is-left">Photograph</span>
        <span className="t-compare-label is-right">Point cloud<span className="t-compare-label-extra"> · intensity</span></span>
        <div
          className="t-compare-handle"
          style={{ left: `${position}%` }}
          role="slider"
          tabIndex={0}
          aria-label="Compare the photograph and the point view"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% photograph`}
          onKeyDown={key}
        >
          <span className="t-compare-grip"><MoveHorizontal size={22} /></span>
        </div>
      </div>
      <figcaption>Drag the laser line, or use the arrow keys, to compare a photograph with the same view re-sampled in code as points on an intensity scale.</figcaption>
    </figure>
  );
}

/** Testimonial carousel with arrows; scroll-snap keeps it swipeable on touch. */
export function TestimonialCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ start: true, end: false, value: 0, size: .5 });
  const update = () => {
    const element = track.current;
    if (!element) return;
    const range = element.scrollWidth - element.clientWidth;
    setProgress({ start: element.scrollLeft < 8, end: element.scrollLeft > range - 8, value: range > 0 ? element.scrollLeft / range : 0, size: element.clientWidth / element.scrollWidth });
  };
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scroll = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const card = element.querySelector('article');
    element.scrollBy({ left: direction * ((card?.clientWidth ?? 400) + 24), behavior: 'smooth' });
  };
  return (
    <div className="t-quotes">
      <div className="t-quotes-intro">
        <p className="t-eyebrow is-light"><span />Sample testimonials</p>
        <h2>What clients<br /><em>say.</em></h2>
        <p>How project teams describe working with a survey partner who understands construction.</p>
        <div className="t-quotes-nav">
          <button type="button" aria-label="Previous testimonial" disabled={progress.start} onClick={() => scroll(-1)}><ArrowLeft size={20} /></button>
          <button type="button" aria-label="Next testimonial" disabled={progress.end} onClick={() => scroll(1)}><ArrowRight size={20} /></button>
        </div>
      </div>
      <div className="t-quotes-main">
      <div className="t-quotes-track" ref={track} onScroll={update}>
        {testimonials.map(item => (
          <article key={item.name} className="t-quote">
            <Quote size={34} className="t-quote-mark" aria-hidden="true" />
            <div className="t-stars" role="img" aria-label="5 out of 5">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" aria-hidden="true" />)}</div>
            <blockquote>“{item.quote}”</blockquote>
            <footer><span className="t-initials">{initials(item.name)}</span><span><strong>{item.name}</strong>{item.role} · {item.company}</span></footer>
          </article>
        ))}
      </div>
      {/* Touch screens get a progress line and arrows under the cards, where the thumb already is. */}
      <div className="t-strip-bar t-quotes-bar">
        <span className="t-strip-progress" aria-hidden="true"><i style={{ width: `${progress.size * 100}%`, left: `${progress.value * (1 - progress.size) * 100}%` }} /></span>
        <div className="t-strip-arrows">
          <button type="button" aria-label="Previous testimonial" disabled={progress.start} onClick={() => scroll(-1)}><ArrowLeft size={20} /></button>
          <button type="button" aria-label="Next testimonial" disabled={progress.end} onClick={() => scroll(1)}><ArrowRight size={20} /></button>
        </div>
      </div>
      </div>
    </div>
  );
}

/** Horizontal strip of company scans; select one to open the viewer. */
export function ScanStrip() {
  const { open, view } = useLightbox(galleryMedia);
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ start: true, end: false, value: 0, size: .5 });
  const update = () => {
    const element = track.current;
    if (!element) return;
    const range = element.scrollWidth - element.clientWidth;
    setProgress({ start: element.scrollLeft < 8, end: element.scrollLeft > range - 8, value: range > 0 ? element.scrollLeft / range : 0, size: element.clientWidth / element.scrollWidth });
  };
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const step = (direction: number) => {
    const element = track.current, item = element?.querySelector('.t-strip-item');
    element?.scrollBy({ left: direction * ((item?.clientWidth ?? 420) + 20), behavior: 'smooth' });
  };
  const bar = (
    <div className="t-strip-bar">
      <span className="t-strip-progress" aria-hidden="true"><i style={{ width: `${progress.size * 100}%`, left: `${progress.value * (1 - progress.size) * 100}%` }} /></span>
      <div className="t-strip-arrows">
        <button type="button" aria-label="Previous scans" disabled={progress.start} onClick={() => step(-1)}><ArrowLeft size={20} /></button>
        <button type="button" aria-label="Next scans" disabled={progress.end} onClick={() => step(1)}><ArrowRight size={20} /></button>
      </div>
    </div>
  );
  return (
    <div className="t-strip-wrap">
      <div className="t-strip" ref={track} onScroll={update}>
        {galleryMedia.map((item, index) => (
          <button key={item.src} type="button" className="t-strip-item" onClick={() => open(index)} aria-label={`${String(index + 1).padStart(2, '0')} · ${item.title}, open larger`}>
            <Media src={item.src} srcSmall={item.small} sizes="(max-width: 767px) 86vw, (max-width: 1100px) 50vw, 33vw" alt={item.alt} width={item.width} height={item.height} ratio="3 / 2" />
            <span className="t-strip-caption"><span>{String(index + 1).padStart(2, '0')} · {item.title}</span><Expand size={16} /></span>
          </button>
        ))}
        <a className="t-strip-more" href="#explore">Open the 3D viewer<Box size={18} /></a>
      </div>
      {bar}
      {view}
    </div>
  );
}
