'use client';

import { Component, type ReactNode, createElement } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches React rendering errors and shows a recovery UI.
 * Prevents blank screens during demo.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-background p-8">
            <div className="rounded-2xl border border-border bg-surface p-8 max-w-md text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto">
                {createElement(AlertTriangle, { className: 'w-6 h-6 text-danger/70', strokeWidth: 1.5 })}
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-text-primary">
                  Something went wrong
                </h2>
                <p className="text-text-muted text-sm">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface-raised hover:bg-surface text-text-secondary hover:text-text-primary font-medium text-sm transition-all"
              >
                {createElement(RefreshCw, { className: 'w-4 h-4', strokeWidth: 1.5 })}
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
