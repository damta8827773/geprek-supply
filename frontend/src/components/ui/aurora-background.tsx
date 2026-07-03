import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

/**
 * Animated "aurora" gradient backdrop (adapted from a 21st.dev / Aceternity
 * component). Re-tinted to the Geprek-Supply orange brand and made dependency
 * free (no framer-motion, no CSS-color-vars plugin - colors are inlined).
 */
export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950',
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `[--white-gradient:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)]
            [--aurora:repeating-linear-gradient(100deg,#fdba74_10%,#fb923c_15%,#f59e0b_20%,#fdba74_25%,#ea580c_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            blur-[10px] invert filter dark:invert-0
            after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
            after:[background-size:200%,_100%]
            after:[background-attachment:fixed] after:mix-blend-difference after:content-[""]
            after:animate-aurora after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            pointer-events-none absolute -inset-[10px] opacity-40 will-change-transform`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`,
          )}
        ></div>
      </div>
      {children}
    </div>
  );
};
