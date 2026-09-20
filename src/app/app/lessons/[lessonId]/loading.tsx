import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
      <Skeleton className="h-80 w-full rounded-card" />
      <div className="flex justify-end">
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
