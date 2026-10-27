'use client';
import { useEffect, useRef, useState } from 'react';

/** Counts up to `value` the first time it scrolls into view. */
export function CountUp({ value, suffix = '', plain = false, duration = 1400 }: { value: number; suffix?: string; plain?: boolean; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Years like 2003 count over a short range so they still read as a year.
    const from = plain ? value - 30 : 0;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - t, 4);
        setShown(Math.round(from + (value - from) * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      setShown(from);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, plain, duration]);
  return <span ref={ref} className="count-up">{shown}{suffix}</span>;
}
