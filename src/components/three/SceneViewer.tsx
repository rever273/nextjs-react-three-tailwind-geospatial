'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, RotateCcw, Plus, Minus, Hand } from 'lucide-react';
import type { DisplayMode, SceneVariant } from '@/lib/spatialGeometry';
import type { CorporateView } from './InterchangeCanvas';

const Canvas = dynamic(() => import('./InterchangeCanvas'), { ssr: false, loading: () => null });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type Capability = 'loading' | 'ready' | 'unavailable' | 'reduced';

/** WebGL availability, reduced motion, viewport size and on-screen state for a viewer. */
function useSceneEnvironment(ref: React.RefObject<HTMLDivElement | null>) {
  const [capability, setCapability] = useState<Capability>('loading');
  const [visible, setVisible] = useState(false), [activated, setActivated] = useState(false), [mobile, setMobile] = useState(false);
  const [started, setStarted] = useState(false);
  const fail = useCallback(() => setCapability('unavailable'), []);
  // three.js and point sampling are heavy: the static render paints first and stays the largest
  // contentful paint; the live scene starts on the first interaction or a few seconds after load.
  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'touchstart', 'scroll', 'keydown', 'wheel'];
    let timer = 0;
    const start = () => { clearTimeout(timer); events.forEach(name => window.removeEventListener(name, start)); setStarted(true); };
    const schedule = () => { timer = window.setTimeout(start, 3000); };
    events.forEach(name => window.addEventListener(name, start, { once: true, passive: true }));
    if (document.readyState === 'complete') schedule(); else window.addEventListener('load', schedule, { once: true });
    return () => { clearTimeout(timer); window.removeEventListener('load', schedule); events.forEach(name => window.removeEventListener(name, start)); };
  }, []);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'), small = matchMedia('(max-width: 767px)');
    const detect = () => {
      setMobile(small.matches);
      if (reduced.matches) { setCapability('reduced'); return; }
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) { setCapability('unavailable'); return; }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        setCapability('ready');
      } catch { setCapability('unavailable'); }
    };
    const frame = requestAnimationFrame(detect);
    reduced.addEventListener('change', detect);
    small.addEventListener('change', detect);
    const observer = new IntersectionObserver(([entry]) => { setVisible(entry.isIntersecting); if (entry.isIntersecting) setActivated(true); }, { rootMargin: '120px' });
    if (ref.current) observer.observe(ref.current);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); reduced.removeEventListener('change', detect); small.removeEventListener('change', detect); };
  }, [ref]);
  return { capability, ready: capability === 'ready', visible, activated: activated && started, mobile, fail };
}

const number = (n: number) => new Intl.NumberFormat('en-AU').format(n);

function GestureHint({ mobile }: { mobile: boolean }) {
  const [shown, setShown] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setShown(false), 3600); return () => clearTimeout(timer); }, []);
  return <span className={`scene-hint ${shown ? 'is-shown' : ''}`} aria-hidden="true"><Hand size={18} />{mobile ? 'Swipe sideways to rotate' : 'Drag to rotate'}</span>;
}

export function SceneViewer({ variant }: { variant: SceneVariant }) {
  const corporate = variant === 'corporate';
  const ref = useRef<HTMLDivElement>(null);
  const env = useSceneEnvironment(ref);
  // Corporate starts on the solid model and, the first time it is seen, slowly scans into points.
  const [view, setView] = useState<CorporateView>('model');
  const [technologyMode, setTechnologyMode] = useState<DisplayMode>('Elevation');
  const [intro, setIntro] = useState(true), [introStarted, setIntroStarted] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const mode: DisplayMode = corporate ? 'Elevation' : technologyMode;
  const [sweep, setSweep] = useState<number | null>(null), [autoSweep, setAutoSweep] = useState(0);
  const [paused, setPaused] = useState(false), [reset, setReset] = useState(0), [zoom, setZoom] = useState(0), [count, setCount] = useState(0);
  const sweepShown = sweep ?? autoSweep;
  const pointsVisible = !corporate || sweepShown > .02;
  useEffect(() => {
    if (!corporate || introStarted || !env.ready || !env.visible) return;
    const timer = setTimeout(() => { setIntroStarted(true); setView('points'); }, 900);
    return () => clearTimeout(timer);
  }, [corporate, introStarted, env.ready, env.visible]);
  return (
    <div className={`scene-viewer scene-${variant}`} ref={ref}>
      <div className="viewer-bar">
        <p className="viewer-title">{corporate ? 'Generic interchange · procedural model' : 'Spatial data explorer'}</p>
        <div className="viewer-tabs" role="group" aria-label={corporate ? 'View' : 'Colour mode'}>
          {corporate
            ? (['model', 'points'] as CorporateView[]).map(item => <button key={item} type="button" aria-pressed={view === item} disabled={!env.ready} onClick={() => { setIntroStarted(true); setIntro(false); setView(item); setSweep(null); }}>{item === 'model' ? 'Model' : 'Point cloud'}</button>)
            : <>{(['RGB', 'Elevation', 'Intensity'] as DisplayMode[]).map(item => <button key={item} type="button" aria-pressed={mode === item} disabled={!env.ready} onClick={() => setTechnologyMode(item)}>{item}</button>)}<button type="button" className="viewer-toggle" aria-pressed={showModel} disabled={!env.ready} onClick={() => setShowModel(on => !on)}>Model</button></>}
        </div>
      </div>
      <div className="scene-stage">
        <img className="scene-fallback" src={`/assets/interchange-${corporate ? "light" : "dark"}.webp`} srcSet={`/assets/interchange-${corporate ? "light" : "dark"}-800.webp 800w, /assets/interchange-${corporate ? "light" : "dark"}.webp 2133w`} sizes="(max-width: 767px) 100vw, 1320px" width={2133} height={1200} loading="lazy" decoding="async" alt="Static view of the procedural interchange: terrain, carriageways, an overpass and a ramp" />
        {env.ready && env.activated && (
          <div className="canvas-layer">
            <SceneBoundary onFailure={env.fail}>
              <Canvas variant={variant} view={view} sweep={sweep} onSweep={value => { setAutoSweep(value); if (value >= .999) setIntro(false); }} sweepSeconds={intro ? 6 : 1.6} showModel={!corporate && showModel} mode={mode} paused={paused || !env.visible} reset={reset} zoom={zoom} mobile={env.mobile} onCount={setCount} onFailure={env.fail} />
            </SceneBoundary>
          </div>
        )}
        {env.ready && <GestureHint mobile={env.mobile} />}
        <div className="scene-corner scene-corner-tl" aria-hidden="true" /><div className="scene-corner scene-corner-br" aria-hidden="true" />
        {!corporate && env.ready && (
          <div className="scene-legend" aria-label={`${mode} colour scale`}>
            <span>{mode === 'Elevation' ? 'RL 24 m' : mode === 'Intensity' ? 'High' : 'Surface colour'}</span>
            <i className={`legend-${mode.toLowerCase()}`} />
            <span>{mode === 'Elevation' ? 'RL 0 m' : mode === 'Intensity' ? 'Low · synthetic' : 'as captured'}</span>
          </div>
        )}
        <div className="scene-zoom">
          <button type="button" aria-label="Zoom in" disabled={!env.ready} onClick={() => setZoom(n => n + 1)}><Plus size={20} /></button>
          <button type="button" aria-label="Zoom out" disabled={!env.ready} onClick={() => setZoom(n => n - 1)}><Minus size={20} /></button>
        </div>
        {!env.ready && env.capability !== 'loading' && <p className="scene-static">{env.capability === 'reduced' ? 'Static view — reduced motion is on' : 'Static view — WebGL is unavailable'}</p>}
      </div>
      <div className="viewer-controls">
        <div className="viewer-buttons">
          <button type="button" disabled={!env.ready} onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? <Play size={18} /> : <Pause size={18} />}{paused ? 'Resume' : 'Pause'}</button>
          <button type="button" disabled={!env.ready} onClick={() => { setReset(n => n + 1); setZoom(0); }}><RotateCcw size={18} />Reset view</button>
        </div>
        {corporate && env.ready && (
          <label className="sweep-control">
            <span>Scan plane</span>
            <input type="range" min={0} max={100} value={Math.round(sweepShown * 100)} onChange={event => setSweep(Number(event.target.value) / 100)} aria-label="Move the scan plane across the model" />
          </label>
        )}
        {env.ready && pointsVisible && <p className="viewer-count">Points rendered <strong>{number(count)}</strong></p>}
      </div>
      <p className="viewer-note">{corporate ? 'Generic procedural interchange — not a real project.' : 'Generic procedural interchange. Intensity values are synthetic.'}</p>
    </div>
  );
}

/** Full-bleed laser-scan point cloud for the Technology hero. */
export function HeroPointCloud({ mode }: { mode: DisplayMode | 'Hero' }) {
  const ref = useRef<HTMLDivElement>(null);
  const env = useSceneEnvironment(ref);
  return (
    <div className="hero-cloud" ref={ref}>
      <picture>
        <source media="(max-width: 767px)" srcSet="/assets/interchange-hero-portrait.webp" width={640} height={1200} />
        <img className="hero-cloud-fallback" src="/assets/interchange-hero.webp" width={2133} height={1200} alt="" fetchPriority="high" decoding="async" />
      </picture>
      {env.ready && env.activated && (
        <div className="canvas-layer">
          <SceneBoundary onFailure={env.fail}>
            <Canvas variant="technology" hero mode={mode} paused={!env.visible} reset={0} zoom={0} mobile={env.mobile} onFailure={env.fail} />
          </SceneBoundary>
        </div>
      )}
      {env.ready && <GestureHint mobile={env.mobile} />}
    </div>
  );
}
