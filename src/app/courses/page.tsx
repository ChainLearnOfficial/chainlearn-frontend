"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCourses, useInfiniteCourses } from "@/lib/hooks/use-courses";
import { useCourseStore } from "@/store/course-store";
import { CourseCard } from "@/components/course/course-card";
import { CourseCardSkeleton } from "@/components/shared/loading-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const categories = [
  "All",
  "Stellar Basics",
  "Smart Contracts",
  "DeFi",
  "Soroban",
];

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const { enrollments } = useCourses();
  const progress = useCourseStore((s) => s.progress);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const {
    courses,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
  } = useInfiniteCourses({ category, difficulty });

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.courseId)),
    [enrollments]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const query = search.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );
  }, [courses, search]);

  // Load the next page when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Course Catalog
        </h1>
        <p className="text-gray-500 mt-1 dark:text-gray-400">
          Browse courses and start earning tokens and credentials.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Category:
            </span>
            <div className="flex gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    category === cat
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Difficulty:
            </span>
            <Select
              value={difficulty}
              onValueChange={(value) => setDifficulty(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p role="alert" aria-live="polite" className="text-gray-500 dark:text-gray-400">
            {error}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setCategory("All");
              setDifficulty("All");
              setSearch("");
            }}
          >
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">
            No courses found matching your filters.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setDifficulty("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={enrolledIds.has(course.id)}
                progress={progress[course.id]?.progressPercent}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel + loading indicator */}
          <div ref={sentinelRef} className="h-10" aria-hidden="true" />
          {loadingMore && (
            <div className="flex justify-center py-6 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="sr-only">Loading more courses…</span>
            </div>
          )}
          {!hasMore && (
            <p className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
              You&apos;ve reached the end of the catalog.
            </p>
          )}
        </>
      )}
    </div>
  );
}
