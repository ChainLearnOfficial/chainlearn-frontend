import { CredentialCardSkeleton } from "@/components/shared/loading-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CredentialCardSkeleton key={i} />
      ))}
    </div>
  );
}
