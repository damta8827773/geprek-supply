interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
}

/**
 * Interactive SVG brand mark: a delivery scooter following a dashed road up to a
 * destination pin — representing "smart routing" of supplies. On hover the badge
 * lifts/tilts and emits a pulse ring (pure CSS, scalable & crisp).
 */
export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <span
      className={`group relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
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
        className="relative drop-shadow-md transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-[6deg] group-hover:scale-110"
      >
        <defs>
          <linearGradient id="geprekLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fb923c" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#geprekLogoGrad)" />

        {/* Dashed road curving from the scooter up to the destination */}
        <path
          d="M9 41 C 20 41, 18 24, 33 16"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="2 2.6"
          opacity="0.85"
        />

        {/* Destination pin */}
        <path
          d="M33 9.3 c-2.1 0-3.8 1.7-3.8 3.8 0 2.8 3.8 5.9 3.8 5.9 s3.8-3.1 3.8-5.9 c0-2.1-1.7-3.8-3.8-3.8 z"
          fill="#fff"
        />
        <circle cx="33" cy="13.1" r="1.5" fill="#ea580c" />

        {/* Delivery scooter */}
        <g
          fill="none"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="14" cy="36" r="2.9" />
          <circle cx="25" cy="36" r="2.9" />
          <path d="M14 36 L16.5 31 H21 L23 36" />
          <path d="M21 31 L24 27 H26.5" />
        </g>
        {/* Delivery box on the back */}
        <rect x="11" y="26.4" width="4.6" height="4.6" rx="1" fill="#fff" />
      </svg>
    </span>
  );
}
