interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
}

/**
 * Interactive SVG brand mark: a map/location pin holding a fried-chicken
 * drumstick - i.e. the *location of ayam-geprek supplies*. On hover the badge
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
        aria-label="Pasar Supply logo"
        className="relative drop-shadow-md transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-[6deg] group-hover:scale-110"
      >
        <defs>
          <linearGradient id="geprekLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fb923c" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#geprekLogoGrad)" />

        {/* Location pin */}
        <path
          d="M24 7c-6.2 0-11.2 5-11.2 11.2 0 8.4 11.2 19 11.2 19s11.2-10.6 11.2-19C35.2 12 30.2 7 24 7z"
          fill="#fff"
        />

        {/* Drumstick inside the pin */}
        <circle cx="21.6" cy="16.8" r="4.3" fill="url(#geprekLogoGrad)" />
        <path
          d="M24.4 19.4 L28.4 23.4"
          stroke="#ea580c"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="29.1" cy="24" r="1.7" fill="#fb923c" />
        <circle cx="27.5" cy="25.5" r="1.5" fill="#fb923c" />
      </svg>
    </span>
  );
}
