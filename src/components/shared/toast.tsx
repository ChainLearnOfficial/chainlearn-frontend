"use client";

import { cn } from "@/lib/utils/cn";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  autoClose?: number;
  className?: string;
}

const variantStyles = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const variantIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function Toast({
  message,
  variant = "info",
  onClose,
  autoClose = 5000,
  className,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const Icon = variantIcons[variant];

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 flex-shrink-0 hover:opacity-70"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Simple toast manager hook
export function useToast() {
  const [toasts, setToasts] = useState<
    { id: string; message: string; variant: ToastVariant }[]
  >([]);

  const addToast = (message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { addToast, ToastContainer };
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastContextProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<
    { id: string; message: string; variant: ToastVariant }[]
  >([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastContext must be used within ToastContextProvider");
  }
  return ctx;
}
