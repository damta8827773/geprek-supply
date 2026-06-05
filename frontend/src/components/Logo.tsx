interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
}

/**
 * Interactive SVG brand mark — a map pin inside an orange "squircle" badge.
 * On hover it lifts, tilts, and emits a pulse ring (pure CSS, scalable & crisp).
 */
export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <span
      className={`group relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Pulse ring that fires on hover */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-[28%] bg-brand/40 opacity-0 transition-opacity duration-200 group-hover:animate-ping group-hover:opacity-100"
      />
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        role="img"
        aria-label="Geprek-Supply logo"
        className="relative drop-shadow-md transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-[8deg] group-hover:scale-110"
      >
        <defs>
          <linearGradient id="geprekLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fb923c" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#geprekLogoGrad)" />
        {/* Map pin */}
        <path
          d="M24 12c-5 0-9 4-9 9 0 6.5 9 15 9 15s9-8.5 9-15c0-5-4-9-9-9z"
          fill="#fff"
        />
        <circle
          cx="24"
          cy="21"
          r="3.6"
          fill="#ea580c"
          className="origin-center transition-transform duration-300 group-hover:scale-125"
        />
      </svg>
    </span>
  );
}
