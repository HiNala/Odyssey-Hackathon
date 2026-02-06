export function ArenaBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-white/5" />

      {/* Soft floating orbs for atmosphere */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-pink-200/30 blur-3xl" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
