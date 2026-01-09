import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "rectangular" | "text";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-grey-200";
  
  const variantClasses = {
    default: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label="Loading..."
    />
  );
}

// Pre-built skeleton components
export function ProductImageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="hidden md:flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-lg" />
          ))}
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-6">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

