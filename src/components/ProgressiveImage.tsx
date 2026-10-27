'use client';

import { useEffect, useRef, type ImgHTMLAttributes } from 'react';

export function ProgressiveImage({ className = '', alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = ref.current;
    if (!image) return;
    // Already-decoded images skip the fade so first paint never flickers.
    if (image.complete && image.naturalWidth) image.dataset.loaded = 'true';
    image.dataset.enhanced = 'true';
  }, [props.src]);
  return <img alt={alt} {...props} ref={ref} className={`progressive-image ${className}`} onLoad={event => { event.currentTarget.dataset.loaded = 'true'; props.onLoad?.(event); }} />;
}
