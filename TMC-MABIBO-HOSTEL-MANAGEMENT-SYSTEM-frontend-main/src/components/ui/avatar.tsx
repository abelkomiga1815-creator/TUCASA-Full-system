import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes } from "react"
import { cn } from "@/utils/cn"

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
}

const sizeClasses: Record<string, string> = {
  sm: "h-7 w-7",
  default: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
}

const fallbackSizeClasses: Record<string, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
  xl: "text-lg",
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
}

export const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
        fallbackSizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
AvatarFallback.displayName = "AvatarFallback"