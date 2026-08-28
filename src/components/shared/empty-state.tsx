import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && <Icon className="mx-auto h-12 w-12 text-gray-300 mb-4" />}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {description && <p className="text-gray-500 mb-4 max-w-sm">{description}</p>}
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}
