import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { Variants } from "framer-motion";

function SkeletonBox({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-amber-900/20", className)}
      {...props}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl overflow-hidden glass-card-dark", className)} data-testid="skeleton-card">
      <SkeletonBox className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function StatsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)} data-testid="skeleton-stats">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl glass-card-dark p-5 space-y-3">
          <SkeletonBox className="h-3 w-1/2" />
          <SkeletonBox className="h-8 w-2/3" />
          <SkeletonBox className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl glass-card-dark overflow-hidden", className)} data-testid="skeleton-table">
      <div className="p-4 border-b border-amber-900/20">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonBox key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 border-b border-amber-900/10">
          <div className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonBox
                key={c}
                className={cn("h-3 flex-1", c === 0 && "w-1/3 flex-none")}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-5", className)} data-testid="skeleton-profile">
      <SkeletonBox className="w-14 h-14 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonBox className="h-5 w-1/3" />
        <SkeletonBox className="h-3 w-1/2" />
        <SkeletonBox className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function BentoSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)} data-testid="skeleton-bento">
      <div className="md:col-span-2 md:row-span-2">
        <div className="rounded-xl glass-card-dark p-6 h-full space-y-4">
          <SkeletonBox className="h-6 w-1/2" />
          <SkeletonBox className="aspect-video w-full rounded-lg" />
          <SkeletonBox className="h-3 w-3/4" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl glass-card-dark p-5 space-y-3">
          <SkeletonBox className="w-10 h-10 rounded-lg" />
          <SkeletonBox className="h-4 w-2/3" />
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CarouselSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex gap-4 overflow-hidden", className)} data-testid="skeleton-carousel">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[260px] md:w-[300px]">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} data-testid="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl glass-card-dark p-4">
          <SkeletonBox className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonBox className="h-3 w-2/3" />
          </div>
          <SkeletonBox className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function PageSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" data-testid="page-spinner">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-[3px] border-amber-800/30 border-t-amber-500 animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-transparent border-b-amber-600/50 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      {message && (
        <p className="text-amber-300/50 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("w-5 h-5 text-amber-500 animate-spin", className)}
      data-testid="inline-spinner"
    />
  );
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.58, 1] },
  },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const scrollReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};
