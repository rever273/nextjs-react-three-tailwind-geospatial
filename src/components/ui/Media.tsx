import type { CSSProperties, ReactNode } from 'react';
import { ProgressiveImage } from '../ProgressiveImage';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS aspect-ratio for the frame, e.g. "16 / 10". Defaults to the image ratio. */
  ratio?: string;
  position?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  srcSmall?: string;
  /** Visible badge for stock or illustrative imagery. */
  badge?: string;
  children?: ReactNode;
};

/** Image in a frame that reserves its space and fades the picture in once decoded. */
export function Media({ src, alt, width, height, ratio, position, className = '', priority, sizes, srcSmall, badge, children }: Props) {
  const style = { aspectRatio: ratio ?? `${width} / ${height}`, '--media-position': position ?? '50% 50%' } as CSSProperties;
  return (
    <div className={`media ${className}`} style={style}>
      <ProgressiveImage
        src={src}
        srcSet={srcSmall ? `${srcSmall} 800w, ${src} ${width}w` : undefined}
        sizes={srcSmall ? sizes ?? '(max-width: 767px) 100vw, 50vw' : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      {badge && <span className="media-badge">{badge}</span>}
      {children}
    </div>
  );
}
