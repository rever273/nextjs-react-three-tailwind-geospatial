'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { alwaysOnSchedule, demoSchedule, scannerSnapshot } from '@/lib/simulator';

const key = 'corvane-single-scanner-demo-v1';
type Snapshot = ReturnType<typeof scannerSnapshot>;
const ScannerContext = createContext<{ snap: Snapshot | null; storageAvailable: boolean }>({ snap: null, storageAvailable: true });

/** Holds the tab-session origin; counts are derived from timestamps, never accumulated. */
export function ScannerSimulationProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ origin: number; base: number } | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    const initialise = setTimeout(() => {
      let session = { origin: Date.now(), base: demoSchedule.sampleBase };
      try {
        const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
        if (saved && Number.isFinite(saved.origin) && saved.origin > 0 && saved.origin <= Date.now() && Number.isFinite(saved.base) && saved.base >= 0) session = saved;
        sessionStorage.setItem(key, JSON.stringify(session));
      } catch { setStorageAvailable(false); }
      setSession(session); setNow(Date.now());
    }, 0);
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearTimeout(initialise); clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const snap = session && now !== null ? scannerSnapshot(session.origin, now, session.base, alwaysOnSchedule) : null;
  return <ScannerContext.Provider value={{ snap, storageAvailable }}>{children}</ScannerContext.Provider>;
}

const brisbaneTime = (time: number) => new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Brisbane', weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(time);

/** Digits roll like an odometer; separators stay put. */
function Odometer({ value }: { value: string }) {
  return (
    <span className="odometer" aria-hidden="true">
      {value.split('').map((char, index) => /\d/.test(char)
        ? <span className="odo-digit" key={index} style={{ '--d': Number(char) } as React.CSSProperties}><span>0123456789</span></span>
        : <span className="odo-sep" key={index}>{char}</span>)}
    </span>
  );
}

function Explanation({ storageAvailable }: { storageAvailable: boolean }) {
  return (
    <span className="capture-info">
      <button type="button" className="capture-info-button" aria-label="How this estimate works" aria-describedby="capture-explanation"><Info size={16} /></button>
      <span role="tooltip" id="capture-explanation" className="capture-tooltip">
        Estimate at a conservative {new Intl.NumberFormat('en-AU').format(demoSchedule.rate)} points per second of capture since you opened this page. An illustrative simulation, not live data from any scanner.{storageAvailable ? ' Kept for this browser tab only.' : ''}
      </span>
    </span>
  );
}

/** "While you've been here, one mobile LiDAR scanner could capture N points." */
export function CaptureCounter({ variant }: { variant: 'pill' | 'band' }) {
  const { snap, storageAvailable } = useContext(ScannerContext);
  const formatted = snap ? new Intl.NumberFormat('en-AU').format(snap.count) : new Intl.NumberFormat('en-AU').format(demoSchedule.sampleBase);
  const status = !snap ? 'Starting' : snap.overnight ? 'Overnight' : snap.active ? 'Capturing' : 'Repositioning';
  return (
    <div className={`capture capture-${variant}`} data-state={status.toLowerCase()}>
      <p className="capture-status"><span className="capture-dot" />{status}</p>
      <p className="capture-lead">While you’ve been here, one mobile LiDAR scanner could capture</p>
      <p className="capture-value">
        <span className="sr-only">{formatted} points</span>
        <Odometer value={formatted} />
        <span className="capture-unit">points<Explanation storageAvailable={storageAvailable} /></span>
      </p>
      {snap?.overnight && <p className="capture-next">Next capture window opens {brisbaneTime(snap.nextStart)}, Brisbane time.</p>}
    </div>
  );
}
