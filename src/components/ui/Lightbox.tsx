'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { Media } from '@/content/showcase';

type Item = Media & { title: string };

/** Accessible image viewer on a native <dialog>: arrows, Escape and swipe. */
export function useLightbox(items: Item[]) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const touch = useRef<number | null>(null);
  const open = useCallback((i: number) => { setIndex(i); dialog.current?.showModal(); }, []);
  const step = useCallback((delta: number) => setIndex(i => (i + delta + items.length) % items.length), [items.length]);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'ArrowRight') step(1); if (event.key === 'ArrowLeft') step(-1); };
    element.addEventListener('keydown', key);
    return () => element.removeEventListener('keydown', key);
  }, [step]);
  const item = items[index];
  const view: ReactNode = (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label="Image viewer"
      onClick={event => { if (event.target === dialog.current) dialog.current?.close(); }}
      onTouchStart={event => { touch.current = event.touches[0].clientX; }}
      onTouchEnd={event => { if (touch.current === null) return; const dx = event.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); touch.current = null; }}
    >
      <figure>
        <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" />
        <figcaption><span>{item.title}</span><span>{index + 1} / {items.length}</span></figcaption>
      </figure>
      <button className="lightbox-close" aria-label="Close image viewer" onClick={() => dialog.current?.close()}><X size={22} /></button>
      <button className="lightbox-prev" aria-label="Previous image" onClick={() => step(-1)}><ArrowLeft size={22} /></button>
      <button className="lightbox-next" aria-label="Next image" onClick={() => step(1)}><ArrowRight size={22} /></button>
    </dialog>
  );
  return { open, view };
}
