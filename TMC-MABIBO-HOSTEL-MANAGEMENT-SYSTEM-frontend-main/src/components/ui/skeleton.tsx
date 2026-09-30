import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/utils/cn"

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-xl bg-muted",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
        className
      )}
      {...props}
    />
  )
)
Skeleton.displayName = "Skeleton"