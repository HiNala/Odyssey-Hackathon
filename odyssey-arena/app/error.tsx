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
      <div className="panel-elevated rounded-2xl p-8 max-w-md text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/15 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-danger" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-border-highlight text-text-primary font-medium text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-border-highlight text-text-secondary font-medium text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
