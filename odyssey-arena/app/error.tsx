'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-8">
      <div className="glass rounded-3xl p-8 max-w-md text-center space-y-5">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-white/90">Something went wrong</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium text-sm transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
