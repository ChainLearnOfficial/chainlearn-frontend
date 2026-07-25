"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { CheckCircle, Circle, PlayCircle, Lock } from "lucide-react";
import type { Module } from "@/types/course";
import { formatDuration } from "@/lib/utils/format";

interface ModuleListProps {
  courseId: string;
  modules: Module[];
  completedModuleIds?: string[];
  currentModuleId?: string;
  className?: string;
}

export function ModuleList({
  courseId,
  modules,
  completedModuleIds = [],
  currentModuleId,
  className,
}: ModuleListProps) {
  const sorted = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="font-semibold text-gray-900 mb-3">
        Course Modules ({modules.length})
      </h3>
      {sorted.map((mod, index) => {
        const isCompleted = completedModuleIds.includes(mod.id);
        const isCurrent = mod.id === currentModuleId;
        const isAccessible = isCompleted || isCurrent || index === 0 || completedModuleIds.includes(sorted[index - 1]?.id);

        const content = (
          <>
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isCurrent ? (
                <PlayCircle className="h-5 w-5 text-primary-500" />
              ) : isAccessible ? (
                <Circle className="h-5 w-5 text-gray-300" />
              ) : (
                <Lock className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  isCompleted ? "text-gray-500" : "text-gray-900"
                )}
              >
                {index + 1}. {mod.title}
              </p>
              <p className="text-xs text-gray-500">{mod.description}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDuration(mod.estimatedMinutes)}
            </span>
          </>
        );

        if (!isAccessible) {
          return (
            <div
              key={mod.id}
              role="listitem"
              aria-disabled="true"
              aria-label={`${mod.title} (locked - complete previous modules to unlock)`}
              tabIndex={-1}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3",
                "opacity-50 cursor-not-allowed"
              )}
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={mod.id}
            href={`/courses/${courseId}/modules/${mod.id}`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 cursor-pointer",
              isCurrent && "bg-primary-50 border border-primary-200"
            )}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
