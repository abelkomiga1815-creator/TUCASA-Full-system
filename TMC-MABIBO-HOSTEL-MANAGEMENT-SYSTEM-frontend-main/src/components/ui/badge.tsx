import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/utils/cn"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info" | "soft" | "soft-secondary"
  size?: "default" | "sm" | "lg" | "2xs"
}

const variantClasses: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-input text-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
  soft: "bg-primary/10 text-primary",
  "soft-secondary": "bg-secondary/10 text-secondary",
}

const sizeClasses: Record<string, string> = {
  "2xs": "px-1.5 py-0.5 text-[0.5625rem] gap-0.5",
  sm: "px-2 py-0.5 text-xs gap-0.5",
  default: "px-2.5 py-0.5 text-xs gap-1",
  lg: "px-3 py-1 text-sm gap-1.5",
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        "transition-all duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)
Badge.displayName = "Badge"