import { DigestSkeleton } from "@/components/digest-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-10 w-4/5 rounded bg-muted" />
        <div className="h-16 w-full rounded bg-muted" />
      </div>
      <DigestSkeleton />
    </div>
  );
}
