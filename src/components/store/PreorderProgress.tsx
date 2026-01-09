"use client";

interface PreorderProgressProps {
  claimed: number;
  available: number;
  className?: string;
}

export function PreorderProgress({ claimed, available, className = "" }: PreorderProgressProps) {
  const percentage = available > 0 ? Math.min((claimed / available) * 100, 100) : 0;
  const remaining = Math.max(available - claimed, 0);
  const isAlmostFull = percentage >= 80;
  const isFull = percentage >= 100;

  if (isFull) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-red-600">Sold Out</span>
          <span className="text-muted-foreground">{claimed}/{available} claimed</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-grey-200">
          <div className="h-full w-full bg-red-500" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className={isAlmostFull ? "font-medium text-orange-600" : "text-muted-foreground"}>
          {isAlmostFull ? "Almost Full" : `${remaining} spots left`}
        </span>
        <span className="text-muted-foreground">{claimed}/{available} claimed</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-grey-200">
        <div
          className={`h-full transition-all ${
            isAlmostFull ? "bg-orange-500" : "bg-soft-blue-600"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

