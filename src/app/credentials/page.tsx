"use client";

import { useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { useCredentials } from "@/lib/hooks/use-credentials";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { CredentialCard } from "@/components/credentials/credential-card";
import { CredentialBadge } from "@/components/credentials/credential-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Award, Shield, Search } from "lucide-react";

type SortOption = "date_desc" | "date_asc" | "score_desc" | "score_asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "score_desc", label: "Highest score" },
  { value: "score_asc", label: "Lowest score" },
];

export default function CredentialsPage() {
  const { ready } = useRequireAuth();
  const { credentials, loading } = useCredentials();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [courseId, setCourseId] = useState("All");
  const [sort, setSort] = useState<SortOption>("date_desc");

  const courseOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const cred of credentials) {
      if (!seen.has(cred.courseId)) seen.set(cred.courseId, cred.courseTitle);
    }
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [credentials]);

  const filtered = useMemo(() => {
    let result = credentials;

    if (courseId !== "All") {
      result = result.filter((cred) => cred.courseId === courseId);
    }

    const query = debouncedSearch.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (cred) =>
          cred.courseTitle.toLowerCase().includes(query) ||
          cred.metadata.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
        case "score_desc":
          return (b.metadata.score ?? 0) - (a.metadata.score ?? 0);
        case "score_asc":
          return (a.metadata.score ?? 0) - (b.metadata.score ?? 0);
        case "date_desc":
        default:
          return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
      }
    });

    return sorted;
  }, [credentials, courseId, debouncedSearch, sort]);

  if (!ready) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Credentials</h1>
        <p className="text-gray-500 mt-1">
          Your verifiable on-chain credentials. Share them as proof of your
          skills.
        </p>
      </div>

      {credentials.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Credentials Yet"
          description="Complete courses and pass quizzes to earn verifiable credential NFTs on the Stellar network."
        />
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by course or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10"
                aria-label="Search credentials"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All courses</SelectItem>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No credentials match your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setCourseId("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Badge showcase */}
              <div className="mb-8">
                <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Credential Badges
                </h2>
                <div className="flex flex-wrap gap-6">
                  {filtered.map((cred) => (
                    <CredentialBadge
                      key={cred.id}
                      courseTitle={cred.courseTitle}
                      issuedAt={cred.issuedAt}
                      size="md"
                    />
                  ))}
                </div>
              </div>

              {/* Credential List */}
              <h2 className="text-sm font-medium text-gray-500 mb-4">
                All Credentials
              </h2>
              <div className="space-y-3">
                {filtered.map((cred) => (
                  <CredentialCard key={cred.id} credential={cred} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
