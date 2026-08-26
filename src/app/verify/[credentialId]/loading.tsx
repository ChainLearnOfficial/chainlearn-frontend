import { VerifySkeleton } from "@/components/shared/loading-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <VerifySkeleton />
    </div>
  );
}
