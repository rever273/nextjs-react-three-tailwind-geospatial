import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Semi_Condensed, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import '../src/styles/shared.css';
import '../src/components/chrome/chrome.css';
import '../src/components/three/viewer.css';
import '../src/concepts/technology/technology.css';
import '../src/styles/concept.css';

// All families are SIL OFL and self-hosted at build time. Only the body and heading faces are
// preloaded: on slow mobile connections every preloaded font competes with the hero image.
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap', preload: false });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const barlow = Barlow({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-barlow', display: 'swap' });
const barlowSemi = Barlow_Semi_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-barlow-semi', display: 'swap', preload: false });

const fontVariables = [jetbrains, inter, barlow, barlowSemi].map(font => font.variable).join(' ');

const site = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000';
const description = 'A website concept for a fictional Brisbane surveying firm: interactive 3D point cloud, LiDAR colour modes and responsive design, built with Next.js and Three.js.';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'Corvane Geospatial — Surveying Website Concept',
  description,
  // Indexed as a design concept: the title, description and on-page banner all say the company is fictional.
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  authors: [{ name: 'Roman Starostin', url: 'https://www.linkedin.com/in/roman-starostin-a4666s429/' }],
  openGraph: { title: 'Corvane Geospatial — Surveying Website Concept', description, type: 'website', images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Point-cloud interchange with the Corvane Geospatial concept headline' }] },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#16181d' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" data-scroll-behavior="smooth" className={fontVariables}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
