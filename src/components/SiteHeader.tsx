'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useScrolled } from '@/lib/useScrolled';
import { company } from '@/content/company';
import { Wordmark } from './Wordmark';

type Design = 'technology';

export type NavLink = { label: string; href: string; active?: boolean };

type Props = {
  design: Design;
  links: NavLink[];
  cta: { label: string; href: string; icon?: ReactNode };
  /** Concept-specific extras: a descriptor beside the logo, a contact bar above. */
  descriptor?: ReactNode;
  topBar?: ReactNode;
  brandNote?: ReactNode;
};

/** Sticky header shared by all concepts; each concept styles it independently. */
export function SiteHeader({ design, links, cta, descriptor, topBar, brandNote }: Props) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(24);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  const home = '/';
  return (
    <header className={`site-header header-${design}`} data-scrolled={scrolled} data-open={open}>
      {topBar && <div className="header-topbar">{topBar}</div>}
      <div className="header-main">
        <Link href={home} className="brand" aria-label={`${company.name} home`} onClick={() => setOpen(false)}>
          <span className="brand-plate">
            <Wordmark />
          </span>
          {brandNote}
        </Link>
        {descriptor && <p className="header-descriptor">{descriptor}</p>}
        <nav id={`nav-${design}`} className="site-nav" aria-label="Main navigation">
          <ul>
            {links.map((link, index) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={link.active ? 'page' : undefined} onClick={() => setOpen(false)}>
                  <span className="nav-index" aria-hidden="true">0{index + 1}</span>{link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a className="header-cta" href={cta.href} onClick={() => setOpen(false)}>{cta.icon}<span>{cta.label}</span><ArrowUpRight size={18} aria-hidden="true" /></a>
        </nav>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`nav-${design}`} aria-label={open ? 'Close navigation' : 'Open navigation'}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
