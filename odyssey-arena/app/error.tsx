'use client';

import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="rounded-2xl border border-border bg-surface p-8 max-w-md text-center space-y-5">
        {/* Error icon */}
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-danger/70" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
          <p className="text-text-muted text-sm leading-relaxed">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface-raised hover:bg-fill-subtle text-text-secondary hover:text-text-primary font-medium text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface-raised hover:bg-fill-subtle text-text-muted hover:text-text-secondary font-medium text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
