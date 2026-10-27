'use client';
import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { concept } from '@/content/company';

/** Slim strip above the site that says, on every screen, that this is a concept with a fictional company. */
export function ConceptBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const resize = new ResizeObserver(() => document.documentElement.style.setProperty('--toolbar-height', `${element.offsetHeight}px`));
    resize.observe(element);
    return () => resize.disconnect();
  }, []);
  return (
    <div className="demo-toolbar concept-banner" ref={ref}>
      <div className="demo-note">
        <button type="button" className="demo-info" aria-expanded={open} aria-controls="concept-about" onClick={() => setOpen(value => !value)}><Info size={16} /><span>Concept website</span></button>
        <p id="concept-about" className="demo-about" hidden={!open}>{concept.note} <small>{concept.credit}</small></p>
      </div>
      <p className="concept-banner-text">Fictional company · design &amp; build by <a href={concept.linkedin} target="_blank" rel="noopener noreferrer"><strong>{concept.author}</strong></a></p>
    </div>
  );
}
