"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ChevronDown } from "lucide-react";
import { useErrorStore } from "@/store/error-store";

/**
 * Custom error reporting service
 * Can be replaced with external service (Sentry, LogRocket, etc.)
 */
interface ErrorReportService {
  report: (error: Error, context: ErrorContext) => Promise<void>;
}

interface ErrorContext {
  componentStack?: string | null;
  timestamp: string;
  isDevelopment: boolean;
  url: string;
}

const createDefaultErrorReporter = (): ErrorReportService => {
  return {
    report: async (error: Error, context: ErrorContext) => {
      const payload = {
        message: error.message,
        stack: error.stack,
        ...context,
      };

      // Log to console in development
      if (context.isDevelopment) {
        console.error("[Error Reporter]", payload);
      }

      // Send to external service (placeholder)
      try {
        // await fetch('/api/errors', { method: 'POST', body: JSON.stringify(payload) });
      } catch (err) {
        console.error("Failed to report error:", err);
      }
    },
  };
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback UI to display on error */
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  /** Custom error reporter */
  errorReporter?: ErrorReportService;
  /** Enable developer error details toggle */
  showErrorDetails?: boolean;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  showDetails: boolean;
}

class ErrorBoundaryInner extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryDelays: number[] = [];
  private errorReporter: ErrorReportService;
  private isDevelopment: boolean;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      showDetails: false,
    };
    this.errorReporter = props.errorReporter || createDefaultErrorReporter();
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error details
    this.setState({ errorInfo });

    // Report error to service
    this.reportError(error, errorInfo);

    // Call custom error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  private reportError = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      await this.errorReporter.report(error, {
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        isDevelopment: this.isDevelopment,
        url: typeof window !== "undefined" ? window.location.href : "",
      });
    } catch (err) {
      console.error("Error reporting failed:", err);
    }
  };

  private getExponentialBackoffDelay = (retryCount: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 30s)
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    // Add jitter (±10%)
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);
    return delay + jitter;
  };

  private handleRetry = async () => {
    this.setState({ isRetrying: true });

    try {
      // Reset error state to retry rendering children
      const { retryCount } = this.state;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        isRetrying: false,
      });
    } catch (err) {
      console.error("Retry failed:", err);
      this.setState({ isRetrying: false });
    }
  };

  private toggleDetails = () => {
    this.setState((state) => ({ showDetails: !state.showDetails }));
  };

  private renderErrorDetails = () => {
    const { error, errorInfo, showDetails } = this.state;

    if (!showDetails || !this.props.showErrorDetails) return null;

    return (
      <details className="mt-4 text-left">
        <summary className="cursor-pointer flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900 mb-2">
          <ChevronDown className="h-4 w-4" />
          Error Details (Developer)
        </summary>
        <div className="bg-gray-50 rounded p-3 space-y-2 max-h-48 overflow-y-auto font-mono text-xs text-gray-700">
          {error && (
            <div>
              <p className="font-semibold text-gray-900">Message:</p>
              <p className="break-words whitespace-pre-wrap">{error.message}</p>
            </div>
          )}
          {error?.stack && (
            <div>
              <p className="font-semibold text-gray-900">Stack:</p>
              <p className="break-words whitespace-pre-wrap text-gray-600">
                {error.stack}
              </p>
            </div>
          )}
          {errorInfo?.componentStack && (
            <div>
              <p className="font-semibold text-gray-900">Component Stack:</p>
              <p className="break-words whitespace-pre-wrap text-gray-600">
                {errorInfo.componentStack}
              </p>
            </div>
          )}
        </div>
      </details>
    );
  };

  render() {
    const { hasError, error, retryCount, isRetrying, showDetails } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return (this.props.fallback as (error: Error) => React.ReactNode)(
            error!,
          );
        }
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 max-w-md mb-2">
            We could not render this section. Try again or reload the page.
          </p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mb-6">
              Retry attempt {retryCount}
            </p>
          )}

          {/* Error Details Toggle */}
          {this.props.showErrorDetails && this.isDevelopment && (
            <button
              onClick={this.toggleDetails}
              className="text-xs text-blue-600 hover:text-blue-700 mb-4 underline"
            >
              {showDetails ? "Hide" : "Show"} error details
            </button>
          )}

          {/* Error Details Section */}
          {this.renderErrorDetails()}

          {/* Actions */}
          <div className="flex gap-3 justify-center mt-6">
            <Button
              onClick={this.handleRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>
            <Button
              onClick={() =>
                typeof window !== "undefined" && window.location.reload()
              }
              variant="outline"
              aria-label="Reload the current page"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ApiErrorDisplay() {
  const { error, isTransient, clearError, retry } = useErrorStore();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  if (!error) return null;

  const handleRetry = async () => {
    if (!retry) return;
    setIsRetrying(true);
    try {
      await retry();
      clearError();
      setRetryCount(0);
    } catch (err) {
      console.error("Retry failed:", err);
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md dark:bg-gray-900 dark:text-gray-100">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4 mx-auto dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center dark:text-white">
          {error.status === 401 ? "Authentication Error" : "Request Failed"}
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center dark:text-gray-400">
          {error.message || "An unexpected error occurred."}
        </p>
        {retryCount > 0 && (
          <p className="text-xs text-gray-500 text-center mb-4 dark:text-gray-500">
            Retry attempt {retryCount}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={clearError}
            className="flex-1"
            disabled={isRetrying}
          >
            Dismiss
          </Button>
          {isTransient && retry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Wraps ErrorBoundaryInner and remounts it (via `key`) on route change,
// so an error caught on one route doesn't persist after navigating away.
export function ErrorBoundary(props: ErrorBoundaryProps) {
  const pathname = usePathname();
  return (
    <>
      <ErrorBoundaryInner key={pathname} {...props} />
      <ApiErrorDisplay />
    </>
  );
}
