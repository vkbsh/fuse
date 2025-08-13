import { Skeleton } from "~/components/ui/skeleton";

export default function CoinSkeleton() {
  return (
    <>
      <Skeleton className="w-12 h-12 rounded-xl border border-ring flex shrink-0" />
      <div className="flex flex-col gap-2.5 justify-center w-full">
        <Skeleton className="h-3 w-12" />
        <div className="flex flex-row gap-1">
          <Skeleton className="h-3 w-20" />
          <div className="flex flex-row gap-10 ml-auto">
            <div className="flex flex-row gap-2">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-18" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </>
  );
}
