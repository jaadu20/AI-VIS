import * as React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoaded?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, isLoaded, children, ...props }, ref) => {
    if (isLoaded) return <div ref={ref}>{children}</div>;

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-gray-200 rounded-md",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

const SkeletonText = ({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) => {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 bg-gray-200", className)}
        />
      ))}
    </div>
  );
};

export { Skeleton, SkeletonText };