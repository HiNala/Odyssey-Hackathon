export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="rounded-2xl border border-border bg-surface p-8 max-w-sm w-full space-y-5">
        {/* Logo skeleton */}
        <div className="h-12 w-12 bg-white/[0.04] border border-border rounded-xl mx-auto" />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-white/[0.04] rounded-lg w-3/4 mx-auto" />
          <div className="h-3 bg-white/[0.04] rounded w-1/2 mx-auto" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-10 bg-white/[0.04] rounded-lg" />
          <div className="h-10 bg-white/[0.04] rounded-lg" />
          <div className="h-10 bg-white/[0.04] rounded-lg" />
        </div>

        {/* Spinner */}
        <div className="flex justify-center pt-2">
          <div className="w-5 h-5 border-2 border-white/[0.08] border-t-white/40 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
