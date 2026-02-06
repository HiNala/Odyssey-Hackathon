'use client';

/**
 * ArenaBackground — Subtle, sophisticated dark canvas.
 * No floating orbs. No flashing. Just a refined gradient
 * with a barely-visible grid that gives depth without distraction.
 */
export function ArenaBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Base gradient — deep, rich, grounded */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(245,158,11,0.04) 0%, transparent 60%), #09090b',
        }}
      />

      {/* Subtle grid — structure without noise */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Top edge light — like a subtle stage light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), rgba(245,158,11,0.2), transparent)',
        }}
      />

      {/* Vignette — frames the content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
