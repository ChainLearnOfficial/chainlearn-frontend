"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { CheckCircle, Circle, PlayCircle, Lock, Video, Zap, Clock } from "lucide-react";
import type { Module } from "@/types/course";
import { formatDuration } from "@/lib/utils/format";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const completedIds = new Set([
    ...completedModuleIds,
    ...modules.filter((module) => module.isCompleted).map((module) => module.id),
  ]);

  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
        Course Modules ({modules.length})
      </h3>
      <ScrollArea className="h-[min(24rem,60vh)] pr-3">
        <div className="space-y-1" role="list" aria-label="Module list">
          {sorted.map((mod, index) => {
            const isCompleted = completedIds.has(mod.id);
            const isCurrent = mod.id === currentModuleId;
            const isAccessible =
              isCompleted ||
              isCurrent ||
              index === 0 ||
              completedIds.has(sorted[index - 1]?.id);

            const ContentTypeIcon =
              mod.contentType === "video"
                ? Video
                : mod.contentType === "interactive"
                  ? Zap
                  : null;

            const content = (
              <>
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" aria-label="Completed" />
                  ) : isCurrent ? (
                    <PlayCircle className="h-5 w-5 text-primary-500" aria-label="In progress" />
                  ) : isAccessible ? (
                    <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" aria-label="Not started" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-300 dark:text-gray-600" aria-label="Locked" />
                  )}
                </div>

                {/* Title + description + badges */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isCompleted
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-900 dark:text-gray-100"
                    )}
                  >
                    {index + 1}. {mod.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {mod.description}
                    </p>
                    {/* Content-type badge */}
                    {mod.contentType === "interactive" && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 flex-shrink-0"
                        aria-label="Quiz available"
                      >
                        <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                        Quiz
                      </span>
                    )}
                    {mod.contentType === "video" && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex-shrink-0"
                        aria-label="Video content"
                      >
                        <Video className="h-2.5 w-2.5" aria-hidden="true" />
                        Video
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration + content-type icon */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {formatDuration(mod.estimatedMinutes)}
                  </span>
                  {ContentTypeIcon && (
                    <ContentTypeIcon
                      className={cn(
                        "h-3.5 w-3.5",
                        mod.contentType === "interactive"
                          ? "text-violet-400 dark:text-violet-500"
                          : "text-blue-400 dark:text-blue-500"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </>
            );

            if (!isAccessible) {
              return (
                <div
                  key={mod.id}
                  role="listitem"
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
                role="listitem"
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                  isCurrent && "bg-primary-50 border border-primary-200 dark:bg-primary-900/30 dark:border-primary-800"
                )}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
