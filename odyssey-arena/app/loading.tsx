export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="rounded-2xl border border-border bg-surface p-8 max-w-sm w-full space-y-5">
        {/* Logo skeleton */}
        <div className="h-12 w-12 bg-fill-subtle border border-border rounded-xl mx-auto" />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-fill-subtle rounded-lg w-3/4 mx-auto" />
          <div className="h-3 bg-fill-subtle rounded w-1/2 mx-auto" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-10 bg-fill-subtle rounded-xl" />
          <div className="h-10 bg-fill-subtle rounded-xl" />
          <div className="h-10 bg-fill-subtle rounded-xl" />
        </div>

        {/* Spinner */}
        <div className="flex justify-center pt-2">
          <div className="w-5 h-5 border-2 border-fill-muted border-t-text-secondary rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
