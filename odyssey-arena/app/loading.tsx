import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="panel-elevated rounded-2xl p-8 max-w-sm w-full space-y-5">
        {/* Logo placeholder */}
        <div className="h-10 w-32 bg-surface-elevated rounded-lg mx-auto" />

        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-surface-elevated rounded-md w-3/4 mx-auto" />
          <div className="h-3 bg-surface-elevated rounded-md w-1/2 mx-auto" />
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="h-10 bg-surface-elevated rounded-lg" />
          <div className="h-10 bg-surface-elevated rounded-lg" />
        </div>

        {/* Spinner */}
        <div className="flex justify-center pt-2">
          <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
        </div>
      </div>
    </div>
  );
}
