'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-text mb-2">
        {t.errorBoundaryTitle}
      </h2>
      <p className="text-text-muted mb-6 max-w-md">
        {t.errorBoundaryMessage}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          {t.errorBoundaryRetry}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-card text-text rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          {t.errorBoundaryReload}
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
