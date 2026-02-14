import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Future: Send to monitoring service (e.g., Sentry)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReturnHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="frosted-glass p-8 md:p-12 max-w-md w-full space-y-6">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                An unexpected error occurred. Don't worry, your game data is safe.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
                <p className="text-xs font-mono text-red-800 dark:text-red-200 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={this.handleReset} variant="default" className="flex-1">
                Try Again
              </Button>
              <Button onClick={this.handleReturnHome} variant="outline" className="flex-1">
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
