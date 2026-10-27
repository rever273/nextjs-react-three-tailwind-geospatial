'use client';
import { ArrowUp } from 'lucide-react';
import { useScrollProgress } from '@/lib/useScrolled';

const radius = 24, length = 2 * Math.PI * radius;

/** Appears after the first screen; the ring shows how far down the page you are. */
export function BackToTop() {
  const progress = useScrollProgress();
  const visible = progress > 0.06;
  return (
    <button
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}
    >
      <svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r={radius} className="ring-track" /><circle cx="28" cy="28" r={radius} className="ring-progress" style={{ strokeDasharray: length, strokeDashoffset: length * (1 - progress) }} /></svg>
      <ArrowUp size={20} />
    </button>
  );
}
