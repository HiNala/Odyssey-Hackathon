export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="glass rounded-3xl p-8 max-w-sm w-full space-y-4">
        {/* Logo placeholder */}
        <div className="h-16 w-16 bg-white/10 rounded-xl mx-auto animate-pulse" />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-white/10 rounded-lg w-3/4 mx-auto animate-pulse" />
          <div className="h-3 bg-white/10 rounded w-1/2 mx-auto animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-10 bg-white/10 rounded-lg animate-pulse" />
        </div>

        {/* Spinner */}
        <div className="flex justify-center pt-2">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
