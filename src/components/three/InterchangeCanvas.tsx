'use client';
/* eslint-disable react-hooks/immutability -- three.js materials, planes and the renderer are mutated imperatively in effects and the render loop by design. */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as Controls } from 'three-stdlib';
import { buildSurfaces, sampleScene, scannerOrigin, scenePointBudget, type DisplayMode, type SceneVariant } from '@/lib/spatialGeometry';

export type CorporateView = 'model' | 'points';
export type SceneProps = {
  variant: SceneVariant;
  /** Corporate: the scan plane sweeps towards the model (0) or the point cloud (1). */
  view?: CorporateView;
  /** Manual scan-plane position 0–1; null lets the plane travel to the view. */
  sweep?: number | null;
  onSweep?: (value: number) => void;
  /** Seconds for a full sweep; the first reveal is deliberately slow. */
  sweepSeconds?: number;
  /** Technology viewer: render the solid model under the points. */
  showModel?: boolean;
  /** Technology colour mode; 'Hero' is the laser-scan intensity look. */
  mode?: DisplayMode | 'Hero';
  hero?: boolean;
  paused: boolean;
  reset: number;
  zoom: number;
  mobile: boolean;
  onCount?: (n: number) => void;
  onFailure?: () => void;
};

const SWEEP_MIN = -26, SWEEP_MAX = 26;
const cameraFor = (variant: SceneVariant, hero: boolean, mobile: boolean): [number, number, number] => {
  if (hero) return mobile ? [-28, 19, 32] : [-26, 11, 26];
  const f = mobile ? 1.35 : 1;
  return variant === 'corporate' ? [27 * f, 21 * f, 29 * f] : [28 * f, 23 * f, 28 * f];
};

function Scene({ variant, view = 'points', sweep = null, onSweep, sweepSeconds = 1.6, showModel = false, mode = 'RGB', hero = false, paused, reset, zoom, mobile, onCount }: SceneProps) {
  const surfaces = useMemo(() => buildSurfaces(variant), [variant]);
  const count = scenePointBudget(variant, mobile) * (hero ? 1 : variant === 'technology' ? .85 : 1);
  const data = useMemo(() => sampleScene(surfaces, Math.round(count), hero ? 'azimuth' : 'x'), [surfaces, count, hero]);
  const total = data.positions.length / 3;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(data[mode].slice(), 3));
    return g;
    // Colour updates are blended below rather than rebuilding the geometry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const target = useRef(mode);
  useEffect(() => { target.current = mode; }, [mode]);

  // Clipping planes: the model is kept on one side of the sweep, points on the other.
  const modelPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), -SWEEP_MIN), []);
  const pointPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), SWEEP_MIN), []);
  const pointsMaterial = useMemo(() => new THREE.PointsMaterial({ size: mobile ? (hero ? .15 : .19) : hero ? .1 : variant === 'technology' ? .14 : .15, vertexColors: true, sizeAttenuation: true, transparent: true, depthWrite: false, opacity: 1 }), [mobile, hero, variant]);
  useEffect(() => { pointsMaterial.clippingPlanes = variant === 'corporate' ? [pointPlane] : []; }, [pointsMaterial, pointPlane, variant]);

  const control = useRef<Controls>(null), group = useRef<THREE.Group>(null), sweepMesh = useRef<THREE.Group>(null), beams = useRef<THREE.LineSegments>(null);
  const progress = useRef(0), sweepValue = useRef(view === 'points' ? 1 : 0), lastReport = useRef(-1), lastZoom = useRef(0), idleSince = useRef(0), lastSweepReport = useRef(0);
  const { camera, gl, invalidate, clock: sceneClock } = useThree();

  useEffect(() => { gl.localClippingEnabled = true; gl.domElement.style.setProperty('touch-action', 'pan-y'); }, [gl]);
  useEffect(() => {
    camera.position.set(...cameraFor(variant, hero, mobile));
    // On phones the hero copy sits low, so aim below the scene to lift the cloud into the top half.
    control.current?.target.set(hero ? 1 : 0, hero ? (mobile ? -9 : .6) : -.2, hero ? -1 : 0);
    control.current?.update();
    invalidate();
  }, [reset, mobile, variant, hero, camera, invalidate]);
  useEffect(() => {
    const delta = zoom - lastZoom.current;
    lastZoom.current = zoom;
    if (!delta) return;
    const focus = control.current?.target || new THREE.Vector3();
    const relative = camera.position.clone().sub(focus);
    relative.setLength(THREE.MathUtils.clamp(relative.length() * Math.pow(.85, delta), 18, 90));
    camera.position.copy(focus).add(relative);
    control.current?.update();
    invalidate();
  }, [zoom, camera, invalidate]);
  useEffect(() => { invalidate(); }, [view, invalidate]);
  useEffect(() => () => { geometry.dispose(); pointsMaterial.dispose(); }, [geometry, pointsMaterial]);
  useEffect(() => () => surfaces.forEach(s => s.geometry.dispose()), [surfaces]);

  // Laser beams for the hero: one shared buffer of segments from the scanner outwards.
  const beamGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(56 * 6), 3));
    return g;
  }, []);
  useEffect(() => () => beamGeometry.dispose(), [beamGeometry]);

  useFrame(({ clock }, dt) => {
    const step = Math.min(dt, .05);
    if (!paused) progress.current = Math.min(1, progress.current + step / (hero ? 3.4 : 2.4));
    const p = progress.current;

    // Reveal: hero follows the laser azimuth; others grow along X.
    // Corporate reveals through the scan plane, so all points are drawn from the start.
    const shown = variant === 'corporate' ? total : Math.max(1, Math.floor(total * (hero ? p : Math.min(1, p * 1.2))));
    geometry.setDrawRange(0, shown);
    if (onCount && shown !== lastReport.current && (shown === total || Math.floor(shown / 800) !== Math.floor(lastReport.current / 800))) { lastReport.current = shown; onCount(shown); }

    // Smoothly blend colours towards the selected mode.
    const colour = geometry.getAttribute('color') as THREE.BufferAttribute, goal = data[target.current];
    const arr = colour.array as Float32Array;
    let moving = false;
    for (let i = 0; i < arr.length; i += 6) {
      const d = goal[i] - arr[i];
      if (Math.abs(d) > .004) { moving = true; break; }
    }
    if (moving) { const k = Math.min(1, step * 6); for (let i = 0; i < arr.length; i++) arr[i] += (goal[i] - arr[i]) * k; colour.needsUpdate = true; }

    if (variant === 'corporate') {
      if (sweep !== null) sweepValue.current = sweep;
      else if (!paused) {
        // Constant-speed travel so the plane visibly crosses the whole structure.
        const goal = view === 'model' ? 0 : 1, delta = step / sweepSeconds;
        sweepValue.current = goal > sweepValue.current ? Math.min(goal, sweepValue.current + delta) : Math.max(goal, sweepValue.current - delta);
      }
      const x = SWEEP_MIN + (SWEEP_MAX - SWEEP_MIN) * sweepValue.current;
      modelPlane.constant = -x;
      pointPlane.constant = x;
      if (sweepMesh.current) { sweepMesh.current.position.x = x; sweepMesh.current.visible = sweepValue.current > .005 && sweepValue.current < .995; }
      if (sweep === null && onSweep && clock.elapsedTime - lastSweepReport.current > .08) { lastSweepReport.current = clock.elapsedTime; onSweep(sweepValue.current); }
    }

    if (group.current && !hero) { const t = Math.min(1, p * 1.8), e = 1 - Math.pow(1 - t, 3); group.current.position.y = -1.2 * (1 - e); group.current.scale.setScalar(.92 + .08 * e); }

    if (beams.current) {
      const position = beamGeometry.getAttribute('position') as THREE.BufferAttribute, b = position.array as Float32Array;
      const sweepAngle = -Math.PI + p * Math.PI * 2 + (p >= 1 ? clock.elapsedTime * .35 : 0);
      for (let i = 0; i < 56; i++) {
        const angle = sweepAngle + (i / 56 - .5) * .5, length = 26 + 6 * Math.sin(i * 1.7), lift = -1 + (i % 7) * .7;
        b.set([scannerOrigin.x, 1.6, scannerOrigin.z, scannerOrigin.x + Math.cos(angle) * length, lift, scannerOrigin.z + Math.sin(angle) * length], i * 6);
      }
      position.needsUpdate = true;
      (beams.current.material as THREE.LineBasicMaterial).opacity = p < 1 ? .55 : .14;
    }

    if (control.current) {
      const interacting = idleSince.current > 0 && clock.elapsedTime - idleSince.current < 4;
      control.current.autoRotate = !paused && !interacting && p >= (hero ? 1 : .6);
    }
  });

  const mat = (colour: string, kind: string) => (
    <meshStandardMaterial color={colour} roughness={kind === 'detail' ? .55 : kind === 'road' ? .85 : .92} metalness={kind === 'detail' ? .15 : 0} clippingPlanes={[modelPlane]} clipShadows />
  );

  return (
    <>
      {variant === 'corporate' ? (
        <>
          <hemisphereLight args={['#fff7ea', '#6c6656', 1.6]} />
          <directionalLight position={[18, 30, 14]} intensity={2.8} castShadow={!mobile} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={26} shadow-camera-bottom={-26} shadow-bias={-.0004} />
          <group ref={group}>
            {surfaces.map((s, i) => <mesh key={i} geometry={s.geometry} castShadow={!mobile && s.kind !== 'terrain' && s.kind !== 'marking'} receiveShadow={!mobile}>{mat(s.colour, s.kind)}</mesh>)}
            <points geometry={geometry} material={pointsMaterial} />
          </group>
          <group ref={sweepMesh}>
            <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 2.2, 0]}><planeGeometry args={[38, 9]} /><meshBasicMaterial color="#b4683c" transparent opacity={.14} side={THREE.DoubleSide} depthWrite={false} /></mesh>
            <mesh position={[0, 6.7, 0]}><boxGeometry args={[.06, .06, 38]} /><meshBasicMaterial color="#d9874f" /></mesh>
            <mesh position={[0, -2.3, 0]}><boxGeometry args={[.08, .08, 38]} /><meshBasicMaterial color="#d9874f" /></mesh>
          </group>
          <fog attach="fog" args={['#ece6da', 70, 140]} />
        </>
      ) : (
        <>
          {showModel && !hero && <><hemisphereLight args={['#c9d4e0', '#1a1d22', 1.1]} /><directionalLight position={[18, 30, 14]} intensity={1.6} /></>}
          <group ref={group}>
            {showModel && !hero && surfaces.map((s, i) => <mesh key={i} geometry={s.geometry}><meshStandardMaterial color={s.colour} roughness={.9} transparent opacity={.38} depthWrite={false} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} /></mesh>)}
            <points geometry={geometry} material={pointsMaterial} />
          </group>
          {hero && <lineSegments ref={beams} geometry={beamGeometry}><lineBasicMaterial color="#ff4a3a" transparent opacity={.5} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments>}
          {hero && <mesh position={[scannerOrigin.x, 1.6, scannerOrigin.z]}><sphereGeometry args={[.22, 16, 16]} /><meshBasicMaterial color="#ff5a48" /></mesh>}
          <fog attach="fog" args={[hero ? '#0c0e11' : '#0f1216', 45, 110]} />
        </>
      )}
      <OrbitControls
        ref={control}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={.35}
        maxPolarAngle={1.35}
        autoRotateSpeed={hero ? .45 : .6}
        // Damping keeps easing the camera after autoRotate stops; switching it off makes Pause immediate.
        enableDamping={!paused}
        dampingFactor={.08}
        onStart={() => { idleSince.current = Number.MAX_SAFE_INTEGER; }}
        onEnd={() => { idleSince.current = sceneClock.elapsedTime; }}
      />
    </>
  );
}

export default function InterchangeCanvas(props: SceneProps) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const handle = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, []);
  const background = props.variant === 'corporate' ? '#ece6da' : props.hero ? '#0c0e11' : '#0f1216';
  return (
    <Canvas
      camera={{ position: cameraFor(props.variant, !!props.hero, props.mobile), fov: props.hero ? 38 : 32, near: .1, far: 260 }}
      shadows={props.variant === 'corporate' && !props.mobile ? 'soft' : false}
      dpr={[1, props.mobile ? 1.5 : 1.75]}
      frameloop={props.paused || hidden ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); props.onFailure?.(); });
      }}
    >
      <color attach="background" args={[background]} />
      <Scene {...props} />
    </Canvas>
  );
}
