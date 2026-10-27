// Technical line drawings for decorative backgrounds. Stroke follows currentColor.
type Props = { className?: string; strokeWidth?: number };

function Tripod() {
  return (
    <g>
      <rect x="58" y="230" width="84" height="10" rx="2" />
      {/* Three telescopic legs: an outer and inner section each. */}
      <path d="M68 240 L22 352 M76 240 L32 352" />
      <path d="M96 240 L94 356 M104 240 L106 356" />
      <path d="M124 240 L168 352 M132 240 L178 352" />
      <path d="M38 300 l14 4 M95 300 h12 M150 300 l14 -4" />
      <path d="M18 356 h18 M90 360 h20 M164 356 h18" />
      {/* Laser plummet to the survey mark. */}
      <path d="M100 240 V340" strokeDasharray="3 5" />
      <circle cx="100" cy="346" r="5" />
      <path d="M90 346 h20 M100 336 v20" />
    </g>
  );
}

export function TotalStation({ className = '', strokeWidth = 1.4 }: Props) {
  return (
    <svg className={className} viewBox="0 0 200 364" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Tripod />
      {/* Tribrach and levelling screws. */}
      <rect x="72" y="214" width="56" height="16" rx="3" />
      <circle cx="80" cy="230" r="3" /><circle cx="100" cy="232" r="3" /><circle cx="120" cy="230" r="3" />
      {/* Alidade with keypad and display. */}
      <rect x="62" y="194" width="76" height="20" rx="4" />
      <rect x="74" y="198" width="30" height="12" rx="1.5" />
      <path d="M110 200 h4 M118 200 h4 M126 200 h4 M110 206 h4 M118 206 h4 M126 206 h4" />
      {/* Standards. */}
      <path d="M66 194 V122 Q66 110 78 110 H84 V194" />
      <path d="M134 194 V122 Q134 110 122 110 H116 V194" />
      {/* Telescope seen end-on, with objective rings. */}
      <circle cx="100" cy="146" r="20" />
      <circle cx="100" cy="146" r="12" />
      <circle cx="100" cy="146" r="5" />
      <path d="M100 126 V120 M100 166 V172" />
      {/* Carry handle and sight. */}
      <path d="M72 110 V96 Q72 86 82 86 H118 Q128 86 128 96 V110" />
      <rect x="93" y="80" width="14" height="6" rx="1" />
      {/* Focus and tangent knobs. */}
      <circle cx="144" cy="146" r="6" /><path d="M134 146 h4" />
      <rect x="50" y="152" width="12" height="10" rx="2" /><path d="M62 157 h4" />
    </svg>
  );
}

export function LaserScanner({ className = '', strokeWidth = 1.4 }: Props) {
  return (
    <svg className={className} viewBox="0 0 200 364" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Tripod />
      <rect x="76" y="218" width="48" height="12" rx="3" />
      {/* Body with status display. */}
      <rect x="66" y="132" width="68" height="86" rx="12" />
      <rect x="78" y="176" width="44" height="26" rx="3" />
      <path d="M84 184 h18 M84 191 h28" />
      <circle cx="100" cy="146" r="4" />
      {/* Rotating head and the angled mirror window. */}
      <path d="M72 132 V96 Q72 84 84 84 H116 Q128 84 128 96 V132" />
      <rect x="86" y="94" width="28" height="32" rx="4" />
      <path d="M88 122 L112 98" />
      <path d="M58 108 h10 M132 108 h10" />
      {/* Outgoing beam fan. */}
      <path d="M128 108 L196 70 M128 108 L198 108 M128 108 L196 146" strokeDasharray="2 6" />
    </svg>
  );
}
