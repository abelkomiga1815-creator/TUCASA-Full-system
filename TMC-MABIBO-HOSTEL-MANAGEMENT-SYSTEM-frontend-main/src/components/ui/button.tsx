import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/utils/cn"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" | "soft" | "soft-secondary"
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "2xs"
  loading?: boolean
}

const variantClasses: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary shadow-soft hover:shadow-medium",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary shadow-soft hover:shadow-medium",
  outline: "border border-input bg-white hover:bg-muted active:bg-muted/50 dark:bg-card dark:hover:bg-muted dark:active:bg-muted/50",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive shadow-soft hover:shadow-medium",
  ghost: "hover:bg-muted active:bg-muted/50",
  link: "text-primary underline-offset-4 hover:underline",
  soft: "bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30",
  "soft-secondary": "bg-secondary/10 text-secondary hover:bg-secondary/20 active:bg-secondary/30",
}

const sizeClasses: Record<string, string> = {
  "2xs": "h-6 px-2 text-[0.625rem] gap-1",
  sm: "h-8 px-3 text-sm gap-1.5",
  default: "h-10 px-4 py-2 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
  xl: "h-12 px-8 text-lg gap-2.5",
  icon: "h-10 w-10",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-spring",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        loading && "relative pr-8",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="absolute right-3 flex h-4 w-4 animate-spin">
          <svg className="h-4 w-4 text-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      {children}
    </button>
  )
)
Button.displayName = "Button"