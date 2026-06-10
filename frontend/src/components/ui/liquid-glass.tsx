import React from 'react';

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
}

interface DockIcon {
  src: string;
  alt: string;
  onClick?: () => void;
}

/** Apple-style "liquid glass" wrapper (from a 21st.dev component). */
const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = '',
  style = {},
  href,
  target = '_blank',
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow: '0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)',
    transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
    ...style,
  };

  const content = (
    <div
      className={`relative flex cursor-pointer overflow-hidden font-semibold text-black transition-all duration-700 ${className}`}
      style={glassStyle}
    >
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-3xl"
        style={{ backdropFilter: 'blur(3px)', filter: 'url(#glass-distortion)', isolation: 'isolate' }}
      />
      <div className="absolute inset-0 z-10" style={{ background: 'rgba(255, 255, 255, 0.25)' }} />
      <div
        className="absolute inset-0 z-20 overflow-hidden rounded-3xl"
        style={{
          boxShadow:
            'inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)',
        }}
      />
      <div className="relative z-30">{children}</div>
    </div>
  );

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};

const GlassDock: React.FC<{ icons: DockIcon[]; href?: string }> = ({ icons, href }) => (
  <GlassEffect href={href} className="rounded-3xl p-3 hover:p-4">
    <div className="flex items-center justify-center gap-2 overflow-hidden rounded-3xl px-0.5 py-0">
      {icons.map((icon, index) => (
        <img
          key={index}
          src={icon.src}
          alt={icon.alt}
          className="h-16 w-16 cursor-pointer transition-all duration-700 hover:scale-110"
          style={{
            transformOrigin: 'center center',
            transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
          }}
          onClick={icon.onClick}
        />
      ))}
    </div>
  </GlassEffect>
);

const GlassButton: React.FC<{ children: React.ReactNode; href?: string }> = ({ children, href }) => (
  <GlassEffect href={href} className="overflow-hidden rounded-3xl px-10 py-6 hover:px-11 hover:py-7">
    <div
      className="transition-all duration-700 hover:scale-95"
      style={{ transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)' }}
    >
      {children}
    </div>
  </GlassEffect>
);

/** SVG turbulence/displacement filter that powers the liquid distortion. */
const GlassFilter: React.FC = () => (
  <svg style={{ display: 'none' }}>
    <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves={1} seed={17} result="turbulence" />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
        <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
        <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
      <feSpecularLighting in="softMap" surfaceScale={5} specularConstant={1} specularExponent={100} lightingColor="white" result="specLight">
        <fePointLight x={-200} y={-200} z={300} />
      </feSpecularLighting>
      <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale={200} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

export { GlassEffect, GlassDock, GlassButton, GlassFilter };
export type { DockIcon };
