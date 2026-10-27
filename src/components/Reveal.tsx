'use client';
import { motion } from 'motion/react';
import { useReducedMotionPreference } from '@/lib/useScrolled';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; delay?: number; y?: number; as?: 'div' | 'li' | 'article' };

/** Fades and lifts content into view once. Transform/opacity only, so layout never shifts. */
export function Reveal({ children, className = '', delay = 0, y = 28, as = 'div' }: Props) {
  const reduced = useReducedMotionPreference();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      // Same initial markup on server and client; reduced motion just skips the animation time.
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={reduced ? { duration: 0 } : { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
