import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ViewSkeleton() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="space-y-3 mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} variant="glass">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} variant="glass">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
