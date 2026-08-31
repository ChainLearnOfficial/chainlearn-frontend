import { ProfileSkeleton, FormSkeleton } from "@/components/shared/loading-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <ProfileSkeleton />
      <FormSkeleton fields={5} />
    </div>
  );
}
