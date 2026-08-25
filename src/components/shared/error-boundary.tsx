"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useErrorStore } from "@/store/error-store";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

function ApiErrorDisplay() {
  const { error, isTransient, clearError, retry } = useErrorStore();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!error) return null;

  const handleRetry = async () => {
    if (!retry) return;
    setIsRetrying(true);
    try {
      await retry();
      clearError();
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4 mx-auto">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          {error.status === 401 ? "Authentication Error" : "Request Failed"}
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={clearError} className="flex-1">
            Dismiss
          </Button>
          {isTransient && retry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
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
