"use client";

import { cn } from "@/lib/utils/cn";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  autoClose?: number;
  action?: ToastAction;
  className?: string;
  index?: number;
}

const variantStyles = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const variantIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const SWIPE_DISMISS_THRESHOLD = 80;
const MAX_VISIBLE_TOASTS = 4;

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function Toast({
  message,
  variant = "info",
  onClose,
  autoClose = 5000,
  action,
  className,
  index = 0,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const [dragX, setDragX] = useState(0);
  const [progress, setProgress] = useState(100);
  const dragState = useRef<{ startX: number; dragging: boolean } | null>(null);
  const Icon = variantIcons[variant];

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    closeTimerRef.current = setTimeout(() => onCloseRef.current(), 300);
  }, []);

  useEffect(() => {
    if (autoClose > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / autoClose) * 100);
        setProgress(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 50);

      const timer = setTimeout(dismiss, autoClose);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [autoClose, dismiss]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { startX: e.clientX, dragging: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current?.dragging) return;
    setDragX(e.clientX - dragState.current.startX);
  };

  const handlePointerUp = () => {
    if (!dragState.current?.dragging) return;
    dragState.current.dragging = false;
    if (Math.abs(dragX) > SWIPE_DISMISS_THRESHOLD) {
      dismiss();
    } else {
      setDragX(0);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "fixed right-4 z-[100] flex flex-col gap-0 rounded-lg border shadow-lg transition-all touch-pan-y overflow-hidden",
        visible ? "opacity-100" : "translate-y-2 opacity-0",
        variantStyles[variant],
        className
      )}
      style={{
        bottom: `${16 + index * 72}px`,
        transform: visible ? `translateX(${dragX}px)` : undefined,
        opacity: visible ? Math.max(1 - Math.abs(dragX) / 200, 0.2) : undefined,
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              dismiss();
            }}
            className="flex-shrink-0 text-sm font-semibold underline underline-offset-2 hover:opacity-70"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="flex-shrink-0 hover:opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {progress < 100 && (
        <div className="h-1 w-full bg-black/10 dark:bg-white/10">
          <div
            className="h-full transition-all duration-100 ease-linear bg-current opacity-50"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface AddToastOptions {
  variant?: ToastVariant;
  autoClose?: number;
  action?: ToastAction;
}

interface ToastEntry {
  id: string;
  message: string;
  variant: ToastVariant;
  autoClose?: number;
  action?: ToastAction;
}

// Simple toast manager hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const addToast = useCallback(
    (message: string, options: ToastVariant | AddToastOptions = "info") => {
      const opts: AddToastOptions =
        typeof options === "string" ? { variant: options } : options;
      setToasts((prev) => {
        const withoutDuplicate = prev.filter(
          (toast) => toast.message !== message || toast.variant !== (opts.variant ?? "info")
        );
        return [
          ...withoutDuplicate,
          {
            id: createToastId(),
            message,
            variant: opts.variant ?? "info",
            autoClose: opts.autoClose,
            action: opts.action,
          },
        ].slice(-MAX_VISIBLE_TOASTS);
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = useCallback(
    () => (
      <>
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            autoClose={toast.autoClose}
            action={toast.action}
            onClose={() => removeToast(toast.id)}
            index={index}
          />
        ))}
      </>
    ),
    [toasts, removeToast]
  );

  return { addToast, ToastContainer };
}

interface ToastContextValue {
  addToast: (
    message: string,
    options?: ToastVariant | AddToastOptions
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastContextProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const addToast = useCallback(
    (message: string, options: ToastVariant | AddToastOptions = "info") => {
      const opts: AddToastOptions =
        typeof options === "string" ? { variant: options } : options;
      setToasts((prev) => {
        const variant = opts.variant ?? "info";
        const withoutDuplicate = prev.filter(
          (toast) => toast.message !== message || toast.variant !== variant
        );
        return [
          ...withoutDuplicate,
          {
            id: createToastId(),
            message,
            variant,
            autoClose: opts.autoClose,
            action: opts.action,
          },
        ].slice(-MAX_VISIBLE_TOASTS);
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div aria-live="polite" aria-relevant="additions text">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            autoClose={toast.autoClose}
            action={toast.action}
            onClose={() => removeToast(toast.id)}
            index={index}
          />
        ))}
      </div>
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
