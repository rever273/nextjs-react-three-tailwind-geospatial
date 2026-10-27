'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useReducedMotionPreference } from '@/lib/useScrolled';

type Props = { src: string; poster: string; label: string; className?: string; playLabel?: string; badge?: string; ratio?: string };

/**
 * Muted, inline stock footage. `loop` plays silently while on screen (never with reduced motion)
 * and has a pause button; the default waits for the visitor to press play.
 */
export function StockVideo({ src, poster, label, className = '', playLabel = 'Play the video', badge = 'Illustrative stock footage', ratio, loop = false }: Props & { loop?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotionPreference();
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  // Poster and video stay unrequested until the frame is near the viewport, so they never compete
  // with the hero on first load.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); observer.disconnect(); } }, { rootMargin: '600px 0px' });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (loop && !reduced && !userPaused) void video.play().catch(() => {});
    }, { threshold: .25 });
    observer.observe(video);
    const hidden = () => { if (document.hidden) video.pause(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', hidden); };
  }, [loop, reduced, userPaused, near]);
  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) { setUserPaused(false); void video.play().catch(() => {}); }
    else { setUserPaused(true); video.pause(); }
  };
  return (
    <figure className={`source-video ${className}`}>
      <div className="video-frame" style={ratio ? { aspectRatio: ratio } : undefined}>
        <video
          ref={ref}
          src={near ? src : undefined}
          poster={near ? poster : undefined}
          muted
          playsInline
          loop={loop}
          controls={!loop && started}
          preload={loop ? 'metadata' : 'none'}
          aria-label={label}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
        />
        {!loop && !started && (
          <button type="button" className="video-play" onClick={() => { setStarted(true); void ref.current?.play().catch(() => {}); }}>
            <span className="video-play-icon"><Play size={28} fill="currentColor" /></span><span className="video-play-label">{playLabel}</span>
          </button>
        )}
        {loop && (
          <button type="button" className="video-toggle" onClick={toggle} aria-label={paused ? 'Play video' : 'Pause video'}>
            {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          </button>
        )}
        <span className="media-badge">{badge}</span>
      </div>
    </figure>
  );
}
