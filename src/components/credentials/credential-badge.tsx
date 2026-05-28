"use client";

import { cn } from "@/lib/utils/cn";
import { Award, Shield, CheckCircle } from "lucide-react";

interface CredentialBadgeProps {
  courseTitle: string;
  issuedAt: string;
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CredentialBadge({
  courseTitle,
  issuedAt,
  verified = false,
  size = "md",
  className,
}: CredentialBadgeProps) {
  const sizes = {
    sm: { container: "w-20 h-20", icon: "h-6 w-6", text: "text-[10px]" },
    md: { container: "w-32 h-32", icon: "h-10 w-10", text: "text-xs" },
    lg: { container: "w-48 h-48", icon: "h-16 w-16", text: "text-sm" },
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full",
        "bg-gradient-to-br from-stellar-purple/10 to-stellar-blue/10",
        "border-2 border-dashed border-stellar-purple/30",
        sizes[size].container,
        className
      )}
    >
      <Award
        className={cn("text-stellar-purple", sizes[size].icon)}
      />
      <p
        className={cn(
          "mt-1 font-medium text-gray-900 text-center px-2 line-clamp-2",
          sizes[size].text
        )}
      >
        {courseTitle}
      </p>

      {verified && (
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
