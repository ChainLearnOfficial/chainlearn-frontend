"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type AlertVariant = "default" | "destructive" | "warning" | "success";

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  default: "border-primary-200 bg-primary-50 text-primary-900",
  destructive: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-green-200 bg-green-50 text-green-900",
};

const titleStyles: Record<AlertVariant, string> = {
  default: "text-primary-900",
  destructive: "text-red-900",
  warning: "text-amber-900",
  success: "text-green-900",
};

const descriptionStyles: Record<AlertVariant, string> = {
  default: "text-primary-700",
  destructive: "text-red-700",
  warning: "text-amber-700",
  success: "text-green-700",
};

const dismissStyles: Record<AlertVariant, string> = {
  default: "text-primary-600 hover:bg-primary-100",
  destructive: "text-red-600 hover:bg-red-100",
  warning: "text-amber-600 hover:bg-amber-100",
  success: "text-green-600 hover:bg-green-100",
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      title,
      description,
      action,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);

    if (dismissed) {
      return null;
    }

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border px-4 py-3 text-sm",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            {title && (
              <h5
                className={cn(
                  "font-medium leading-none tracking-tight",
                  titleStyles[variant]
                )}
              >
                {title}
              </h5>
            )}
            {description && (
              <p className={cn("text-sm [&_p]:leading-relaxed", descriptionStyles[variant])}>
                {description}
              </p>
            )}
            {children}
            {action && <div className="pt-2">{action}</div>}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss alert"
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                dismissStyles[variant]
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
