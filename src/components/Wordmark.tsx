/** Corvane wordmark: a survey target and the name, set in the site's own type. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <svg className={`wordmark ${className}`} viewBox="0 0 500 150" role="img" aria-label="Corvane Geospatial">
      <g fill="none" stroke="currentColor" strokeWidth="7">
        <circle cx="72" cy="75" r="50" />
        <path d="M72 9v34M72 107v34M6 75h34M104 75h34" />
      </g>
      <circle cx="72" cy="75" r="13" fill="#e23b2e" />
      <text x="156" y="88" fill="currentColor" fontFamily="var(--font-barlow-semi), 'Arial Narrow', sans-serif" fontSize="86" fontWeight="700" letterSpacing="4">CORVANE</text>
      <text x="160" y="134" fill="#e23b2e" fontFamily="var(--font-jetbrains), monospace" fontSize="30" fontWeight="500" letterSpacing="13.5">GEOSPATIAL</text>
    </svg>
  );
}
